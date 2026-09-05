import { SUPPORT_URL, SUPPORTS_URL, TICKETS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateTicketPayload,
  DeleteSupportTicketResponse,
  SupportsListQuery,
  SupportsListResponse,
  TicketFieldErrors,
  TicketFormValues,
  TicketIssuesType,
  TicketRecord,
  TicketResolutionValue,
  TicketUpdateIssuesType,
  TicketUpdateResolutionValue,
  TicketUpdateStatusValue,
  TicketUrgencyValue,
  UpdateSupportFormValues,
  UpdateSupportPayload,
} from "./types";
import {
  TICKET_ISSUES_TYPE_VALUES,
  TICKET_RESOLUTION_VALUES,
  TICKET_UPDATE_ISSUES_TYPE_VALUES,
  TICKET_UPDATE_RESOLUTION_VALUES,
  TICKET_UPDATE_STATUS_VALUES,
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

const FIELD_KEYS: Array<keyof CreateTicketPayload | keyof UpdateSupportPayload> = [
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
export const SUPPORTS_INVALIDATE_EVENT = "yosti:supports-invalidate";

export function invalidateTicketsCache() {
  window.dispatchEvent(new CustomEvent(TICKETS_INVALIDATE_EVENT));
}

export function invalidateSupportsCache() {
  window.dispatchEvent(new CustomEvent(SUPPORTS_INVALIDATE_EVENT));
  window.dispatchEvent(new CustomEvent(TICKETS_INVALIDATE_EVENT));
}

export function buildSupportsQueryString(query: SupportsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.orderReference.trim()) {
    params.set("orderReference", query.orderReference.trim());
  }
  if (query.issuesType) {
    params.set("issuesType", query.issuesType);
  }
  if (query.resolutionToRequest) {
    params.set("resolutionToRequest", query.resolutionToRequest);
  }
  if (query.urgency) {
    params.set("urgency", query.urgency);
  }
  if (query.status) {
    params.set("status", query.status);
  }

  return params.toString();
}

function normalizeSupportsResponse(
  raw: unknown,
  query: SupportsListQuery
): SupportsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.tickets)
        ? record.tickets
        : Array.isArray(record?.supports)
          ? record.supports
          : [];

  const data = rows
    .map((row) => normalizeTicket(row))
    .filter((row): row is TicketRecord => Boolean(row));

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

export async function fetchSupportsList(
  query: SupportsListQuery
): Promise<SupportsListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new TicketsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${SUPPORTS_URL}?${buildSupportsQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new TicketsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Invalid support ticket filters."),
      400
    );
  }
  if (response.status === 401) {
    throw new TicketsRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new TicketsRequestError(
      readApiMessage(raw, "The server could not load support tickets."),
      response.status
    );
  }
  if (!response.ok) {
    throw new TicketsRequestError(
      readApiMessage(
        raw,
        `Unable to load support tickets. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  return normalizeSupportsResponse(raw, query);
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

export function supportDetailUrl(id: number) {
  return `${SUPPORTS_URL}/${id}`;
}

export function parseSupportTicketId(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return undefined;
  }
  const id = Number.parseInt(trimmed, 10);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export function asSupportTicketId(id: number | string): number | undefined {
  if (typeof id === "number") {
    return Number.isInteger(id) && id > 0 ? id : undefined;
  }
  return parseSupportTicketId(id);
}

function matchEnum<T extends string>(value: string, options: readonly T[]): T | undefined {
  const key = value.trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === key);
}

export function asTicketUpdateIssuesType(value: string): TicketUpdateIssuesType {
  return matchEnum(value, TICKET_UPDATE_ISSUES_TYPE_VALUES) ?? "Defect";
}

export function asTicketUpdateResolution(value: string): TicketUpdateResolutionValue {
  return matchEnum(value, TICKET_UPDATE_RESOLUTION_VALUES) ?? "refund";
}

export function asTicketUpdateUrgency(value: string): TicketUrgencyValue {
  return matchEnum(value, TICKET_URGENCY_VALUES) ?? "medium";
}

export function asTicketUpdateStatus(value: string): TicketUpdateStatusValue {
  const key = value.trim().toLowerCase();
  if (key === "closed") {
    return "close";
  }
  return matchEnum(value, TICKET_UPDATE_STATUS_VALUES) ?? "open";
}

export function ticketToFormValues(ticket: TicketRecord): UpdateSupportFormValues {
  return {
    orderReference: ticket.orderReference,
    issuesType: asTicketUpdateIssuesType(ticket.issuesType),
    title: ticket.title,
    resolutionToRequest: asTicketUpdateResolution(ticket.resolutionToRequest),
    urgency: asTicketUpdateUrgency(ticket.urgency),
    attachment: ticket.attachment,
    status: asTicketUpdateStatus(ticket.status),
  };
}

export function validateUpdateTicketForm(
  values: UpdateSupportFormValues
): TicketFieldErrors {
  const errors: TicketFieldErrors = {};
  if (!values.orderReference.trim()) {
    errors.orderReference = "Order reference is required.";
  }
  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!TICKET_UPDATE_ISSUES_TYPE_VALUES.includes(values.issuesType)) {
    errors.issuesType = "Choose a valid issue type.";
  }
  if (!TICKET_UPDATE_RESOLUTION_VALUES.includes(values.resolutionToRequest)) {
    errors.resolutionToRequest = "Choose a resolution to request.";
  }
  if (!TICKET_URGENCY_VALUES.includes(values.urgency)) {
    errors.urgency = "Choose an urgency level.";
  }
  if (!TICKET_UPDATE_STATUS_VALUES.includes(values.status)) {
    errors.status = "Choose a valid ticket status.";
  }
  if (values.attachment.trim() && !isHttpUrl(values.attachment.trim())) {
    errors.attachment = "Enter a valid http(s) attachment URL.";
  }
  return errors;
}

export function updateFormValuesToPayload(
  values: UpdateSupportFormValues
): UpdateSupportPayload {
  return {
    orderReference: values.orderReference.trim(),
    issuesType: values.issuesType,
    title: values.title.trim(),
    resolutionToRequest: values.resolutionToRequest,
    urgency: values.urgency,
    attachment: values.attachment.trim(),
    status: values.status,
  };
}

const TICKET_NOT_FOUND_MESSAGE =
  "This support ticket could not be found or has been removed.";

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text().catch(() => "");
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function ticketFromResponse(raw: unknown): TicketRecord | null {
  return (
    normalizeTicket(raw) ??
    normalizeTicket(asRecord(raw)?.data) ??
    normalizeTicket(asRecord(raw)?.ticket) ??
    normalizeTicket(asRecord(raw)?.support)
  );
}

export async function patchSupport(
  id: number,
  payload: UpdateSupportPayload
): Promise<TicketRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new TicketsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new TicketsRequestError(TICKET_NOT_FOUND_MESSAGE, 404);
  }

  let response: Response;
  try {
    response = await fetch(supportDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new TicketsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await readResponseBody(response);

  if (response.status === 400) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Unable to save this support ticket. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new TicketsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new TicketsRequestError(TICKET_NOT_FOUND_MESSAGE, 404);
  }
  if (response.status === 409) {
    throw new TicketsRequestError(
      readApiMessage(raw, OPEN_TICKET_CONFLICT_MESSAGE),
      409
    );
  }
  if (response.status >= 500) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Server error occurred. Could not update support ticket."),
      response.status
    );
  }
  if (response.status === 204) {
    invalidateTicketsCache();
    invalidateSupportsCache();
    const synthesized = ticketFromResponse({ id, ...payload });
    if (synthesized) {
      return synthesized;
    }
    throw new TicketsRequestError("The server returned an incomplete support ticket.", 500);
  }
  if (!response.ok) {
    throw new TicketsRequestError(
      readApiMessage(
        raw,
        `Unable to update this support ticket. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  const updated = ticketFromResponse(raw);
  if (!updated) {
    throw new TicketsRequestError("The server returned an incomplete support ticket.", 500);
  }

  invalidateTicketsCache();
  invalidateSupportsCache();
  return updated;
}

export const updateSupport = patchSupport;

const DELETE_SUPPORT_TICKET_SUCCESS = "Support ticket deleted successfully.";

export function parseDeleteSupportTicketResponse(
  raw: unknown
): DeleteSupportTicketResponse {
  return {
    message: readApiMessage(raw, DELETE_SUPPORT_TICKET_SUCCESS),
  };
}

export async function deleteSupportTicket(id: number): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new TicketsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new TicketsRequestError(TICKET_NOT_FOUND_MESSAGE, 404);
  }

  let response: Response;
  try {
    response = await fetch(supportDetailUrl(id), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new TicketsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Unable to delete this support ticket."),
      400
    );
  }
  if (response.status === 401) {
    throw new TicketsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new TicketsRequestError(TICKET_NOT_FOUND_MESSAGE, 404);
  }
  if (response.status >= 500) {
    throw new TicketsRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete support ticket."),
      response.status
    );
  }
  if (response.status !== 200) {
    throw new TicketsRequestError(
      readApiMessage(
        raw,
        `Unable to delete this support ticket. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  const parsed = parseDeleteSupportTicketResponse(raw);
  invalidateTicketsCache();
  invalidateSupportsCache();
  return parsed.message;
}

function ticketStatusKey(value: string) {
  return value.trim().toLowerCase();
}

export function formatTicketLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }
  return trimmed
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatTicketStatus(value: string) {
  return formatTicketLabel(value);
}

export function formatTicketUrgency(value: string) {
  return formatTicketLabel(value);
}

export function isOpenTicketStatus(value: string) {
  return ticketStatusKey(value) === "open";
}

export function isResolvedTicketStatus(value: string) {
  return ticketStatusKey(value) === "resolved";
}

export function isClosedTicketStatus(value: string) {
  const key = ticketStatusKey(value);
  return key === "close" || key === "closed";
}

export function isHighTicketUrgency(value: string) {
  return ticketStatusKey(value) === "high";
}

export function isMediumTicketUrgency(value: string) {
  return ticketStatusKey(value) === "medium";
}

export function isLowTicketUrgency(value: string) {
  return ticketStatusKey(value) === "low";
}

export async function fetchSupportTicket(id: number): Promise<TicketRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new TicketsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new TicketsRequestError(TICKET_NOT_FOUND_MESSAGE, 404);
  }

  let response: Response;
  try {
    response = await fetch(supportDetailUrl(id), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new TicketsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new TicketsRequestError(
      readApiMessage(raw, "The support ticket ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new TicketsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new TicketsRequestError(TICKET_NOT_FOUND_MESSAGE, 404);
  }
  if (response.status >= 500) {
    throw new TicketsRequestError(
      readApiMessage(raw, "The server could not load this support ticket."),
      response.status
    );
  }
  if (!response.ok) {
    throw new TicketsRequestError(
      readApiMessage(
        raw,
        `Unable to load this support ticket. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  const record = asRecord(raw);
  const payload =
    normalizeTicket(raw) ??
    normalizeTicket(record?.data) ??
    normalizeTicket(record?.ticket) ??
    normalizeTicket(record?.support);

  if (!payload) {
    throw new TicketsRequestError("The server returned an incomplete support ticket.", 500);
  }

  return payload;
}
