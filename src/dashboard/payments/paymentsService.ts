import { PAYMENTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  PaymentRecord,
  PaymentsListQuery,
  PaymentsListResponse,
} from "./types";

export { isPreviewAccessToken };

export class PaymentsRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PaymentsRequestError";
    this.status = status;
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

export function buildPaymentsQueryString(query: PaymentsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.service) {
    params.set("service", query.service);
  }
  if (query.method) {
    params.set("method", query.method);
  }
  if (query.status) {
    params.set("status", query.status);
  }

  return params.toString();
}

export function normalizePayment(raw: unknown): PaymentRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.paymentId, record.payment_id);
  if (id === undefined) {
    return null;
  }

  const user = asRecord(record.user);

  return {
    id,
    userId:
      pickNumber(record.userId, record.user_id, user?.id, user?.userId, user?.user_id) ??
      0,
    service: pickString(record.service, record.serviceType, record.service_type),
    method: pickString(record.method, record.paymentMethod, record.payment_method),
    status: pickString(record.status),
  };
}

function normalizePaymentsResponse(
  raw: unknown,
  query: PaymentsListQuery
): PaymentsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.payments)
        ? record.payments
        : [];

  const data = rows
    .map((row) => normalizePayment(row))
    .filter((row): row is PaymentRecord => Boolean(row));

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

export async function fetchPaymentsList(
  query: PaymentsListQuery
): Promise<PaymentsListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${PAYMENTS_URL}?${buildPaymentsQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new PaymentsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new PaymentsRequestError(readApiMessage(raw, "Invalid payment filters."), 400);
  }
  if (response.status === 401) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "The server could not load payments."),
      response.status
    );
  }
  if (!response.ok) {
    throw new PaymentsRequestError(
      readApiMessage(raw, `Unable to load payments. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizePaymentsResponse(raw, query);
}

export const PAYMENTS_INVALIDATE_EVENT = "yosti:payments-invalidate";

export function invalidatePaymentsCache() {
  window.dispatchEvent(new CustomEvent(PAYMENTS_INVALIDATE_EVENT));
}

export function paymentsUrl() {
  return PAYMENTS_URL;
}
