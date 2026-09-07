import { sanitizeApiMessage } from "../apiMessage";
import { REQUESTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { buildListQueryVariants, fetchAuthorizedList } from "../http";
import { extractListRows, pickEntityId } from "../listResponse";
import type {
  RequestFieldErrors,
  RequestUpdatePayload,
  RequestsListQuery,
  RequestsListResponse,
  SourcingRequestRecord,
} from "./types";

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
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
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

function pickMoney(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const cleaned = value.replace(/[^0-9.-]/g, "");
      const number = Number(cleaned);
      if (cleaned && Number.isFinite(number)) {
        return number;
      }
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
    return sanitizeApiMessage(message, fallback);
  }
  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string").join(", ");
    if (text) {
      return sanitizeApiMessage(text, fallback);
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
      item.toLowerCase().includes(field.toLowerCase()),
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

  const idValue = pickEntityId(
    record.id,
    record.requestId,
    record.request_id,
    record._id,
  );
  const id =
    idValue !== undefined
      ? String(idValue)
      : pickString(record.id, record.requestId, record.request_id, record._id);
  const productName =
    pickString(
      record.productName,
      record.product_name,
      record.product,
      record.title,
      record.name,
    ) || "Untitled request";
  if (!id) {
    return null;
  }

  return {
    id,
    productName,
    description: pickString(record.description),
    quantity: pickNumber(record.quantity) ?? 0,
    targetPrice: pickMoney(record.targetPrice, record.target_price) ?? 0,
    supplierRegion:
      pickString(record.supplierRegion, record.supplier_region) || "—",
    deadline: pickString(record.deadline),
    status: pickString(record.status) || "open",
    createdAt: pickString(record.createdAt, record.created_at),
    updatedAt: pickString(record.updatedAt, record.updated_at),
  };
}

function normalizeRequestsResponse(
  raw: unknown,
  query: RequestsListQuery,
): RequestsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = extractListRows(raw);

  const data = rows
    .map((row) => normalizeRequest(row))
    .filter((row): row is SourcingRequestRecord => Boolean(row));

  const total =
    pickNumber(meta?.total, record?.total, nested?.total) ?? data.length;
  const page = pickNumber(record?.page, nested?.page) ?? query.page;
  const limit =
    pickNumber(record?.limit, record?.pageSize, nested?.limit) ??
    query.pageSize;
  const totalPages =
    pickNumber(record?.totalPages, record?.total_pages, nested?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { data, total, page, limit, totalPages };
}

export async function fetchRequestsList(
  query: RequestsListQuery,
): Promise<RequestsListResponse> {
  if (!getAccessToken()) {
    throw new RequestsRequestError("Unauthorized", 401);
  }

  const result = await fetchAuthorizedList(
    REQUESTS_URL,
    buildListQueryVariants(query.page, query.pageSize, {
      search: query.search.trim() || undefined,
      supplierRegion: query.supplierRegion || undefined,
      deadline: deadlineToIso(query.deadline) || undefined,
    }),
  );

  if (result.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(result.data, "Invalid request filters."),
      400,
    );
  }
  if (result.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (result.status >= 500) {
    throw new RequestsRequestError(
      readApiMessage(
        result.data,
        "We couldn't load sourcing requests.",
      ),
      result.status,
    );
  }
  if (!result.ok) {
    throw new RequestsRequestError(
      readApiMessage(
        result.data,
        "We couldn't load this information. Please try again.",
      ),
      result.status,
    );
  }

  return normalizeRequestsResponse(result.data, query);
}

export async function fetchRequestById(
  id: string,
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
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new RequestsRequestError(
      "We couldn't connect. Check your connection and try again.",
      0,
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The request ID format is invalid."),
      400,
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new RequestsRequestError(
      "Request not found. It may have been deleted or the ID is incorrect.",
      404,
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      readApiMessage(raw, "We couldn't load this request."),
      response.status,
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(
        raw,
        "We couldn't load this request. Please try again.",
      ),
      response.status,
    );
  }

  const record = asRecord(raw);
  const payload =
    normalizeRequest(raw) ??
    normalizeRequest(record?.data) ??
    normalizeRequest(record?.request);

  if (!payload) {
    throw new RequestsRequestError(
      "We couldn't read this request. Please try again.",
      500,
    );
  }

  return payload;
}

export async function patchRequest(
  id: string,
  payload: RequestUpdatePayload,
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
      "We couldn't connect. Check your connection and try again.",
      0,
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(
        raw,
        "Unable to save this request. Check the highlighted fields.",
      ),
      400,
      parseFieldErrors(raw),
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new RequestsRequestError(
      "This request no longer exists or was removed.",
      404,
    );
  }
  if (response.status === 409) {
    throw new RequestsRequestError(
      "This update conflicts with an existing active request.",
      409,
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      readApiMessage(raw, "We couldn't save this request."),
      response.status,
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(
        raw,
        "We couldn't save this request. Please try again.",
      ),
      response.status,
    );
  }

  const record = asRecord(raw);
  const updated =
    normalizeRequest(raw) ??
    normalizeRequest(record?.data) ??
    normalizeRequest(record?.request);

  if (!updated) {
    throw new RequestsRequestError(
      "We couldn't read this request. Please try again.",
      500,
    );
  }

  invalidateRequestsCache();
  return updated;
}

export async function deleteRequest(
  id: string,
): Promise<SourcingRequestRecord | null> {
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
      "We couldn't connect. Check your connection and try again.",
      0,
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new RequestsRequestError(
      readApiMessage(raw, "The request ID format is invalid."),
      400,
    );
  }
  if (response.status === 401) {
    throw new RequestsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new RequestsRequestError(
      "This request has already been deleted or does not exist.",
      404,
    );
  }
  if (response.status >= 500) {
    throw new RequestsRequestError(
      "Server error occurred. Could not delete request.",
      response.status,
    );
  }
  if (!response.ok) {
    throw new RequestsRequestError(
      readApiMessage(
        raw,
        "We couldn't delete this request. Please try again.",
      ),
      response.status,
    );
  }

  invalidateRequestsCache();
  return normalizeRequest(raw) ?? normalizeRequest(asRecord(raw)?.data) ?? null;
}
