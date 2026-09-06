import { CONTACTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  ContactFieldErrors,
  ContactFormValues,
  ContactRecord,
  ContactsListQuery,
  ContactsListResponse,
  CreateContactPayload,
  CreateContactResult,
  UpdateContactPayload,
} from "./types";

export { isPreviewAccessToken };

export class ContactRequestError extends Error {
  status: number;
  fields?: ContactFieldErrors;
  code?: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK";

  constructor(
    message: string,
    status: number,
    fields?: ContactFieldErrors,
    code?: ContactRequestError["code"]
  ) {
    super(message);
    this.name = "ContactRequestError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export const CONTACT_NOT_FOUND_MESSAGE =
  "This contact submission could not be found or has been removed.";
export const CONTACT_SUBMITTED_MESSAGE =
  "Thank you! Your message was sent successfully";
export const CONTACTS_INVALIDATE_EVENT = "yosti:contacts-invalidate";

export function invalidateContactsCache() {
  window.dispatchEvent(new CustomEvent(CONTACTS_INVALIDATE_EVENT));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }
  return undefined;
}

function readApiMessage(raw: unknown, fallback: string) {
  const record = asRecord(raw);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string").join(", ");
    if (text) {
      return text;
    }
  }
  return fallback;
}

const FIELD_KEYS: Array<keyof ContactFieldErrors> = [
  "fullname",
  "phoneWhatsapp",
  "email",
  "topic",
  "details",
];

function parseFieldErrors(raw: unknown): ContactFieldErrors {
  const record = asRecord(raw);
  const fields: ContactFieldErrors = {};
  const nested = asRecord(record?.fields) ?? asRecord(record?.errors) ?? asRecord(record?.message);

  if (nested) {
    for (const key of Object.keys(nested)) {
      if (FIELD_KEYS.includes(key as keyof ContactFieldErrors)) {
        const value = pickString(nested[key]);
        if (value) {
          fields[key as keyof ContactFieldErrors] = value;
        }
      }
    }
  }

  return fields;
}

export function asContactId(value: unknown): number | undefined {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}

export function contactDetailUrl(id: number) {
  return `${CONTACTS_URL}/${id}`;
}

export function whatsappDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function whatsappHref(phone: string) {
  const digits = whatsappDigits(phone);
  return digits ? `https://wa.me/${digits}` : "";
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function snippet(details: string, length = 90) {
  const text = details.replace(/\s+/g, " ").trim();
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length).trim()}…`;
}

export function validateContactForm(values: ContactFormValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  if (!values.fullname.trim()) {
    errors.fullname = "Full name is required.";
  }
  if (!values.phoneWhatsapp.trim()) {
    errors.phoneWhatsapp = "WhatsApp number is required.";
  } else if (whatsappDigits(values.phoneWhatsapp).length < 8) {
    errors.phoneWhatsapp = "Enter a valid WhatsApp number.";
  }
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isEmail(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.topic.trim()) {
    errors.topic = "Topic is required.";
  }
  if (!values.details.trim()) {
    errors.details = "Details are required.";
  }
  return errors;
}

export function formValuesToPayload(values: ContactFormValues): CreateContactPayload {
  return {
    fullname: values.fullname.trim(),
    phoneWhatsapp: values.phoneWhatsapp.trim(),
    email: values.email.trim(),
    topic: values.topic.trim(),
    details: values.details.trim(),
  };
}

export function contactToFormValues(contact: ContactRecord): ContactFormValues {
  return {
    fullname: contact.fullname,
    phoneWhatsapp: contact.phoneWhatsapp,
    email: contact.email,
    topic: contact.topic,
    details: contact.details,
  };
}

export function normalizeContact(raw: unknown): ContactRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.contactId, record.contact_id);
  if (id === undefined) {
    return null;
  }

  return {
    id,
    fullname: pickString(record.fullname, record.fullName, record.name),
    phoneWhatsapp: pickString(
      record.phoneWhatsapp,
      record.phone_whatsapp,
      record.phone,
      record.whatsapp
    ),
    email: pickString(record.email),
    topic: pickString(record.topic, record.subject),
    details: pickString(record.details, record.message, record.body),
  };
}

function contactFromResponse(raw: unknown): ContactRecord | null {
  return (
    normalizeContact(raw) ??
    normalizeContact(asRecord(raw)?.data) ??
    normalizeContact(asRecord(raw)?.contact)
  );
}

function requireToken() {
  const token = getAccessToken();
  if (!token) {
    throw new ContactRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return token;
}

function authHeaders(required: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (required) {
    throw new ContactRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return headers;
}

export function buildContactsQueryString(query: ContactsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.fullname.trim()) {
    params.set("fullname", query.fullname.trim());
  }
  if (query.email.trim()) {
    params.set("email", query.email.trim());
  }
  if (query.topic.trim()) {
    params.set("topic", query.topic.trim());
  }

  return params.toString();
}

function normalizeContactsResponse(
  raw: unknown,
  query: ContactsListQuery
): ContactsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.contacts)
        ? record.contacts
        : [];

  const data = rows
    .map((row) => normalizeContact(row))
    .filter((row): row is ContactRecord => Boolean(row));

  const total = pickNumber(meta?.total, record?.total, nested?.total) ?? data.length;
  const page = pickNumber(meta?.page, record?.page, nested?.page) ?? query.page;
  const pageSize =
    pickNumber(meta?.pageSize, record?.pageSize, record?.limit, nested?.pageSize) ??
    query.pageSize;
  const totalPages =
    pickNumber(meta?.totalPages, record?.totalPages, nested?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    data,
    meta: { total, page, pageSize, totalPages },
  };
}

export async function submitContact(
  payload: CreateContactPayload
): Promise<CreateContactResult> {
  let response: Response;
  try {
    response = await fetch(CONTACTS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ContactRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ContactRequestError(
      readApiMessage(raw, "Unable to send this message. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new ContactRequestError(
      readApiMessage(raw, "Server error occurred. Could not send your message."),
      response.status
    );
  }

  const created = contactFromResponse(raw);
  invalidateContactsCache();
  return {
    record: created ?? {
      id: pickNumber(asRecord(raw)?.id) ?? 0,
      ...payload,
    },
    message: readApiMessage(raw, CONTACT_SUBMITTED_MESSAGE),
  };
}

export async function fetchContactsList(
  query: ContactsListQuery
): Promise<ContactsListResponse> {
  requireToken();

  let response: Response;
  try {
    response = await fetch(`${CONTACTS_URL}?${buildContactsQueryString(query)}`, {
      method: "GET",
      headers: authHeaders(true),
    });
  } catch {
    throw new ContactRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ContactRequestError(
      readApiMessage(raw, "Invalid contact filters."),
      400,
      undefined,
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new ContactRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new ContactRequestError(
      readApiMessage(raw, "The server could not load contact submissions."),
      response.status
    );
  }

  return normalizeContactsResponse(raw, query);
}

export async function fetchContact(id: number): Promise<ContactRecord> {
  requireToken();
  if (asContactId(id) === undefined) {
    throw new ContactRequestError(CONTACT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(contactDetailUrl(id), {
      method: "GET",
      headers: authHeaders(true),
    });
  } catch {
    throw new ContactRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new ContactRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new ContactRequestError(CONTACT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (!response.ok) {
    throw new ContactRequestError(
      readApiMessage(raw, "The server could not load this contact submission."),
      response.status
    );
  }

  const contact = contactFromResponse(raw);
  if (!contact) {
    throw new ContactRequestError("The server returned an incomplete contact submission.", 500);
  }
  return contact;
}

export async function patchContact(
  id: number,
  payload: UpdateContactPayload
): Promise<ContactRecord> {
  const token = requireToken();
  if (asContactId(id) === undefined) {
    throw new ContactRequestError(CONTACT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(contactDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ContactRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ContactRequestError(
      readApiMessage(raw, "Unable to save this contact. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new ContactRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new ContactRequestError(CONTACT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (!response.ok) {
    throw new ContactRequestError(
      readApiMessage(raw, "Server error occurred. Could not update contact."),
      response.status
    );
  }

  const updated = contactFromResponse(raw);
  if (!updated) {
    throw new ContactRequestError("The server returned an incomplete contact submission.", 500);
  }

  invalidateContactsCache();
  return updated;
}

export async function deleteContact(id: number): Promise<string> {
  const token = requireToken();
  if (asContactId(id) === undefined) {
    throw new ContactRequestError(CONTACT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(contactDetailUrl(id), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ContactRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new ContactRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new ContactRequestError(CONTACT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (response.status !== 200) {
    throw new ContactRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete contact."),
      response.status
    );
  }

  invalidateContactsCache();
  return readApiMessage(raw, "Contact submission deleted successfully.");
}
