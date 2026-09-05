import { SUPPORT_URL, SUPPORTS_URL, TICKETS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateTicketPayload,
  SupportsListQuery,
  SupportsListResponse,
  TicketFieldErrors,
  TicketFormValues,
  TicketIssuesType,
  TicketRecord,
  TicketResolutionValue,
  TicketUrgencyValue,
} from "./types";
import {
  TICKET_ISSUES_TYPE_VALUES,
  TICKET_RESOLUTION_VALUES,
  TICKET_URGENCY_VALUES,
} from "./types";

export { isPreviewAccessToken };

export class TicketsRequestError extends Error {
  status: number;
  fields?: TicketFieldErrors;

  constructor(message: string, status: number, fields?: TicketFieldErrors) {
    super(message);
    this.name = "TicketsRequestError";
    this.status = status;
    this.fields = fields;
  }
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

function pickId(...values: unknown[]): number | string | undefined {
  const numeric = pickNumber(...values);
  if (numeric !== undefined) {
    return numeric;
  }
  const text = pickString(...values);
  return text || undefined;
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

const FIELD_KEYS: Array<keyof CreateTicketPayload> = [
  "orderReference",
  "issuesType",
  "title",
  "resolutionToRequest",
  "urgency",
  "attachment",
  "status",
];

function parseFieldErrors(raw: unknown): TicketFieldErrors {
  const record = asRecord(raw);
  const message = record?.message;
  const fields: TicketFieldErrors = {};
  const nested = asRecord(message) ?? asRecord(record?.errors);

  if (nested) {
    for (const key of FIELD_KEYS) {
      const value = pickString(nested[key]);
      if (value) {
        fields[key] = value;
      }
    }
  }

  const items = Array.isArray(message)
    ? message.filter((item): item is string => typeof item === "string")
    : typeof message === "string"
      ? [message]
      : [];

  for (const item of items) {
    const key = FIELD_KEYS.find((field) =>
      item.toLowerCase().includes(field.toLowerCase())
    );
    if (key && !fields[key]) {
      fields[key] = item;
    }
  }

  return fields;
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateTicketForm(values: TicketFormValues): TicketFieldErrors {
  const errors: TicketFieldErrors = {};
  if (!values.orderReference.trim()) {
    errors.orderReference = "Order reference is required.";
  }
  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!TICKET_ISSUES_TYPE_VALUES.includes(values.issuesType)) {
    errors.issuesType = "Choose a valid issue type.";
  }
  if (!TICKET_RESOLUTION_VALUES.includes(values.resolutionToRequest)) {
    errors.resolutionToRequest = "Choose a resolution to request.";
  }
  if (!TICKET_URGENCY_VALUES.includes(values.urgency)) {
    errors.urgency = "Choose an urgency level.";
  }
  if (values.attachment.trim() && !isHttpUrl(values.attachment.trim())) {
    errors.attachment = "Enter a valid http(s) attachment URL.";
  }
  return errors;
}

export function formValuesToPayload(values: TicketFormValues): CreateTicketPayload {
  return {
    orderReference: values.orderReference.trim(),
    issuesType: values.issuesType as TicketIssuesType,
    title: values.title.trim(),
    resolutionToRequest: values.resolutionToRequest as TicketResolutionValue,
    urgency: values.urgency as TicketUrgencyValue,
    attachment: values.attachment.trim(),
    status: "open",
  };
}

export function normalizeTicket(raw: unknown): TicketRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickId(
    record.id,
    record.ticketId,
    record.ticket_id,
    record.supportId,
    record.support_id
  );
  if (id === undefined) {
    return null;
  }

  const user = asRecord(record.user);

  return {
    id,
    userId:
      pickNumber(record.userId, record.user_id, user?.id, user?.userId, user?.user_id) ??
      0,
    orderReference: pickString(
      record.orderReference,
      record.order_reference,
      record.orderRef,
      record.order_ref
    ),
    issuesType: pickString(record.issuesType, record.issueType, record.issue_type),
    title: pickString(record.title, record.subject),
    resolutionToRequest: pickString(
      record.resolutionToRequest,
      record.resolution_to_request,
      record.resolutionRequested,
      record.resolution_requested
    ),
    urgency: pickString(record.urgency),
    attachment: pickString(
      record.attachment,
      record.attachmentUrl,
      record.attachment_url,
      record.photoVideoUrl,
      record.photo_video_url
    ),
    status: pickString(record.status) || "open",
  };
}

export const OPEN_TICKET_CONFLICT_MESSAGE =
  "An active open support ticket already exists for this request. Our team is currently reviewing it.";

export const TICKETS_INVALIDATE_EVENT = "yosti:tickets-invalidate";

export function invalidateTicketsCache() {
  window.dispatchEvent(new CustomEvent(TICKETS_INVALIDATE_EVENT));
}

function ticketsCreateUrls() {
  return [...new Set([TICKETS_URL, SUPPORT_URL, SUPPORTS_URL])];
}

async function postTicket(
  url: string,
  token: string,
  payload: CreateTicketPayload
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function createTicket(payload: CreateTicketPayload): Promise<TicketRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new TicketsRequestError("Unauthorized", 401);
  }

  const urls = ticketsCreateUrls();
  let response: Response | undefined;
  let lastNetworkError = false;

  for (const [index, url] of urls.entries()) {
    try {
      response = await postTicket(url, token, payload);
    } catch {
      lastNetworkError = true;
      if (index < urls.length - 1) {
        continue;
      }
      throw new TicketsRequestError(
        "Unable to reach the server. Check your connection and try again.",
        0
      );
    }

    lastNetworkError = false;
    if (response.status === 404 && index < urls.length - 1) {
      continue;
    }
    break;
  }

  if (!response) {
    throw new TicketsRequestError(
      lastNetworkError
        ? "Unable to reach the server. Check your connection and try again."
        : "Unable to create this support ticket.",
      lastNetworkError ? 0 : 500
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Unable to create this support ticket. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new TicketsRequestError("Unauthorized", 401);
  }
  if (response.status === 409) {
    throw new TicketsRequestError(OPEN_TICKET_CONFLICT_MESSAGE, 409);
  }
  if (response.status >= 500) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Server error occurred. Could not create support ticket."),
      response.status
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new TicketsRequestError(
      readApiMessage(
        raw,
        `Unable to create support ticket. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  const created =
    normalizeTicket(raw) ??
    normalizeTicket(asRecord(raw)?.data) ??
    normalizeTicket(asRecord(raw)?.ticket) ??
    normalizeTicket(asRecord(raw)?.support);

  if (!created) {
    throw new TicketsRequestError("The server returned an incomplete support ticket.", 500);
  }

  invalidateTicketsCache();
  return created;
}
