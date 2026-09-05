import { REQUESTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  RequestFieldErrors,
  RequestUpdatePayload,
  RequestsListQuery,
  RequestsListResponse,
  SourcingRequestRecord,
} from "./types";

export { isPreviewAccessToken };

export class RequestsRequestError extends Error {
  status: number;
  fields?: RequestFieldErrors;

  constructor(message: string, status: number, fields?: RequestFieldErrors) {
    super(message);
    this.name = "RequestsRequestError";
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

export function deadlineToIso(dateValue: string) {
  if (!dateValue) {
    return "";
  }
  const iso = new Date(`${dateValue}T23:59:59.999Z`);
  return Number.isNaN(iso.getTime()) ? "" : iso.toISOString();
}

export function buildRequestsQueryString(query: RequestsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.supplierRegion) {
    params.set("supplierRegion", query.supplierRegion);
  }

  const deadline = deadlineToIso(query.deadline);
  if (deadline) {
    params.set("deadline", deadline);
  }

  return params.toString();
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

const FIELD_KEYS: Array<keyof RequestUpdatePayload> = [
  "productName",
  "description",
  "quantity",
  "targetPrice",
  "supplierRegion",
  "deadline",
  "status",
];

function parseFieldErrors(raw: unknown): RequestFieldErrors {
  const record = asRecord(raw);
  const message = record?.message;
  const fields: RequestFieldErrors = {};
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

export const REQUESTS_INVALIDATE_EVENT = "yosti:requests-invalidate";

export function invalidateRequestsCache() {
  window.dispatchEvent(new CustomEvent(REQUESTS_INVALIDATE_EVENT));
}

export function requestDetailUrl(id: string) {
  return `${REQUESTS_URL}/${encodeURIComponent(id)}`;
}

export function normalizeRequest(raw: unknown): SourcingRequestRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickString(record.id, record.requestId, record.request_id);
  const productName = pickString(
    record.productName,
    record.product_name,
    record.name
  );
  if (!id || !productName) {
    return null;
  }

  return {
    id,
    productName,
    description: pickString(record.description),
    quantity: pickNumber(record.quantity) ?? 0,
    targetPrice: pickNumber(record.targetPrice, record.target_price) ?? 0,
    supplierRegion: pickString(record.supplierRegion, record.supplier_region) || "—",
    deadline: pickString(record.deadline),
    status: pickString(record.status) || "open",
    createdAt: pickString(record.createdAt, record.created_at),
    updatedAt: pickString(record.updatedAt, record.updated_at),
  };
}

function normalizeRequestsResponse(
  raw: unknown,
  query: RequestsListQuery
): RequestsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.requests)
        ? record.requests
        : [];

  const data = rows
    .map((row) => normalizeRequest(row))
    .filter((row): row is SourcingRequestRecord => Boolean(row));

  const total = pickNumber(record?.total, nested?.total) ?? data.length;
  const page = pickNumber(record?.page, nested?.page) ?? query.page;
  const limit =
    pickNumber(record?.limit, record?.pageSize, nested?.limit) ?? query.pageSize;
  const totalPages =
    pickNumber(record?.totalPages, record?.total_pages, nested?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { data, total, page, limit, totalPages };
}

export async function fetchRequestsList(
  query: RequestsListQuery
): Promise<RequestsListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new RequestsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${REQUESTS_URL}?${buildRequestsQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new RequestsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(raw, "Invalid request filters."),
      400
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 403) {
    throw new RequestsRequestError(
      "Access Denied: You do not have the required permissions to view this resource.",
      403
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The server could not load sourcing requests."),
      response.status
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(raw, `Unable to load requests. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeRequestsResponse(raw, query);
}

export async function fetchRequestById(id: string): Promise<SourcingRequestRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new RequestsRequestError("Unauthorized", 401);
  }

  const requestId = id.trim();
  if (!requestId) {
    throw new RequestsRequestError("The request ID format is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch(requestDetailUrl(requestId), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new RequestsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The request ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 403) {
    throw new RequestsRequestError(
      "Access Denied: You do not have the required permissions to view this resource.",
      403
    );
  }
  if (response.status === 404) {
    throw new RequestsRequestError(
      "Request not found. It may have been deleted or the ID is incorrect.",
      404
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The server could not load this request."),
      response.status
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(raw, `Unable to load this request. Server returned ${response.status}.`),
      response.status
    );
  }

  const record = asRecord(raw);
  const payload =
    normalizeRequest(raw) ??
    normalizeRequest(record?.data) ??
    normalizeRequest(record?.request);

  if (!payload) {
    throw new RequestsRequestError("The server returned an incomplete request.", 500);
  }

  return payload;
}

export async function patchRequest(
  id: string,
  payload: RequestUpdatePayload
): Promise<SourcingRequestRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new RequestsRequestError("Unauthorized", 401);
  }

  const requestId = id.trim();
  if (!requestId) {
    throw new RequestsRequestError("The request ID format is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch(requestDetailUrl(requestId), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new RequestsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(raw, "Unable to save this request. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new RequestsRequestError(
      "This request no longer exists or was removed.",
      404
    );
  }
  if (response.status === 409) {
    throw new RequestsRequestError(
      "This update conflicts with an existing active request.",
      409
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The server could not save this request."),
      response.status
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(raw, `Unable to save this request. Server returned ${response.status}.`),
      response.status
    );
  }

  const record = asRecord(raw);
  const updated =
    normalizeRequest(raw) ??
    normalizeRequest(record?.data) ??
    normalizeRequest(record?.request);

  if (!updated) {
    throw new RequestsRequestError("The server returned an incomplete request.", 500);
  }

  invalidateRequestsCache();
  return updated;
}

export async function deleteRequest(id: string): Promise<SourcingRequestRecord | null> {
  const token = getAccessToken();
  if (!token) {
    throw new RequestsRequestError("Unauthorized", 401);
  }

  const requestId = id.trim();
  if (!requestId) {
    throw new RequestsRequestError("The request ID format is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch(requestDetailUrl(requestId), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new RequestsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The request ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new RequestsRequestError(
      "This request has already been deleted or does not exist.",
      404
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      "Server error occurred. Could not delete request.",
      response.status
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(raw, `Unable to delete this request. Server returned ${response.status}.`),
      response.status
    );
  }

  invalidateRequestsCache();
  return normalizeRequest(raw) ?? normalizeRequest(asRecord(raw)?.data) ?? null;
}
