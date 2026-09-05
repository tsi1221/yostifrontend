import { PAYMENTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreatePaymentPayload,
  PaymentFieldErrors,
  PaymentFormValues,
  PaymentMethodValue,
  PaymentRecord,
  PaymentServiceValue,
  PaymentUpdateStatusValue,
  PaymentsListQuery,
  PaymentsListResponse,
  UpdatePaymentFormValues,
  UpdatePaymentPayload,
} from "./types";
import {
  PAYMENT_METHOD_VALUES,
  PAYMENT_SERVICE_VALUES,
  PAYMENT_UPDATE_STATUS_VALUES,
} from "./types";

export { isPreviewAccessToken };

export class PaymentsRequestError extends Error {
  status: number;
  fields?: PaymentFieldErrors;

  constructor(message: string, status: number, fields?: PaymentFieldErrors) {
    super(message);
    this.name = "PaymentsRequestError";
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

const PAYMENT_FIELD_KEYS: Array<
  keyof CreatePaymentPayload | keyof UpdatePaymentPayload
> = ["service", "method", "status"];

function parseFieldErrors(raw: unknown): PaymentFieldErrors {
  const record = asRecord(raw);
  const message = record?.message;
  const fields: PaymentFieldErrors = {};
  const nested = asRecord(message) ?? asRecord(record?.errors);

  if (nested) {
    for (const key of PAYMENT_FIELD_KEYS) {
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
    const key = PAYMENT_FIELD_KEYS.find((field) =>
      item.toLowerCase().includes(field.toLowerCase())
    );
    if (key && !fields[key]) {
      fields[key] = item;
    }
  }

  return fields;
}

export const PENDING_PAYMENT_CONFLICT_MESSAGE =
  "An active pending payment record already exists for this service. Please check your transaction history before attempting another payment.";

export function validatePaymentForm(values: PaymentFormValues): PaymentFieldErrors {
  const errors: PaymentFieldErrors = {};
  if (!PAYMENT_SERVICE_VALUES.includes(values.service as PaymentServiceValue)) {
    errors.service = "Choose a service.";
  }
  if (!PAYMENT_METHOD_VALUES.includes(values.method as PaymentMethodValue)) {
    errors.method = "Choose a payment method.";
  }
  return errors;
}

export function formValuesToPayload(values: PaymentFormValues): CreatePaymentPayload {
  return {
    service: values.service as PaymentServiceValue,
    method: values.method as PaymentMethodValue,
    status: "Pending",
  };
}

export async function createPayment(payload: CreatePaymentPayload): Promise<PaymentRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(PAYMENTS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PaymentsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "Unable to initiate this payment. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }
  if (response.status === 409) {
    throw new PaymentsRequestError(PENDING_PAYMENT_CONFLICT_MESSAGE, 409);
  }
  if (response.status >= 500) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "Server error occurred. Could not initiate payment."),
      response.status
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new PaymentsRequestError(
      readApiMessage(raw, `Unable to initiate payment. Server returned ${response.status}.`),
      response.status
    );
  }

  const created =
    normalizePayment(raw) ??
    normalizePayment(asRecord(raw)?.data) ??
    normalizePayment(asRecord(raw)?.payment);

  if (!created) {
    throw new PaymentsRequestError("The server returned an incomplete payment.", 500);
  }

  invalidatePaymentsCache();
  return created;
}

export const PAYMENTS_INVALIDATE_EVENT = "yosti:payments-invalidate";

export function invalidatePaymentsCache() {
  window.dispatchEvent(new CustomEvent(PAYMENTS_INVALIDATE_EVENT));
}

export function paymentsUrl() {
  return PAYMENTS_URL;
}

export function paymentDetailUrl(id: number) {
  return `${PAYMENTS_URL}/${id}`;
}

export function parsePaymentId(value: string | undefined): number | undefined {
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

function paymentStatusKey(value: string) {
  return value.trim().toLowerCase();
}

export function formatPaymentStatus(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }
  return trimmed
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isPendingPaymentStatus(value: string) {
  return paymentStatusKey(value) === "pending";
}

export function isCompletedPaymentStatus(value: string) {
  return paymentStatusKey(value) === "completed";
}

export function isFailedOrRefundedPaymentStatus(value: string) {
  const key = paymentStatusKey(value);
  return key === "failed" || key === "refunded";
}

export async function fetchPayment(id: number): Promise<PaymentRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new PaymentsRequestError(
      "This transaction record could not be found or does not exist,",
      404
    );
  }

  let response: Response;
  try {
    response = await fetch(paymentDetailUrl(id), {
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
    throw new PaymentsRequestError(
      readApiMessage(raw, "The payment ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new PaymentsRequestError(
      "This transaction record could not be found or does not exist,",
      404
    );
  }
  if (response.status >= 500) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "The server could not load this transaction record."),
      response.status
    );
  }
  if (!response.ok) {
    throw new PaymentsRequestError(
      readApiMessage(
        raw,
        `Unable to load this transaction record. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  const record = asRecord(raw);
  const payload =
    normalizePayment(raw) ??
    normalizePayment(record?.data) ??
    normalizePayment(record?.payment);

  if (!payload) {
    throw new PaymentsRequestError(
      "The server returned an incomplete transaction record.",
      500
    );
  }

  return payload;
}

function matchEnum<T extends string>(value: string, options: readonly T[]): T | undefined {
  const key = value.trim().toLowerCase();
  return options.find((option) => option.toLowerCase() === key);
}

export function asPaymentService(value: string): PaymentServiceValue {
  return matchEnum(value, PAYMENT_SERVICE_VALUES) ?? "Logistic";
}

export function asPaymentMethod(value: string): PaymentMethodValue {
  return matchEnum(value, PAYMENT_METHOD_VALUES) ?? "Card";
}

export function asPaymentUpdateStatus(value: string): PaymentUpdateStatusValue {
  return matchEnum(value, PAYMENT_UPDATE_STATUS_VALUES) ?? "Pending";
}

export function paymentToFormValues(payment: PaymentRecord): UpdatePaymentFormValues {
  return {
    service: asPaymentService(payment.service),
    method: asPaymentMethod(payment.method),
    status: asPaymentUpdateStatus(payment.status),
  };
}

export function validateUpdatePaymentForm(
  values: UpdatePaymentFormValues
): PaymentFieldErrors {
  const errors: PaymentFieldErrors = {};
  if (!PAYMENT_SERVICE_VALUES.includes(values.service)) {
    errors.service = "Choose a service.";
  }
  if (!PAYMENT_METHOD_VALUES.includes(values.method)) {
    errors.method = "Choose a payment method.";
  }
  if (!PAYMENT_UPDATE_STATUS_VALUES.includes(values.status)) {
    errors.status = "Choose a valid payment status.";
  }
  return errors;
}

export function updateFormValuesToPayload(
  values: UpdatePaymentFormValues
): UpdatePaymentPayload {
  return {
    service: values.service,
    method: values.method,
    status: values.status,
  };
}

export async function patchPayment(
  id: number,
  payload: UpdatePaymentPayload
): Promise<PaymentRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new PaymentsRequestError("The payment ID is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch(paymentDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new PaymentsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "Unable to save this payment. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new PaymentsRequestError(
      "This payment could not be found or has been removed.",
      404
    );
  }
  if (response.status >= 500) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "Server error occurred. Could not update payment."),
      response.status
    );
  }
  if (!response.ok) {
    throw new PaymentsRequestError(
      readApiMessage(raw, `Unable to update payment. Server returned ${response.status}.`),
      response.status
    );
  }

  const updated =
    normalizePayment(raw) ??
    normalizePayment(asRecord(raw)?.data) ??
    normalizePayment(asRecord(raw)?.payment);

  if (!updated) {
    throw new PaymentsRequestError("The server returned an incomplete payment.", 500);
  }

  invalidatePaymentsCache();
  return updated;
}

const DELETE_PAYMENT_SUCCESS = "Payment deleted successfully.";

export async function deletePayment(id: number): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new PaymentsRequestError("The payment ID format is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch(paymentDetailUrl(id), {
      method: "DELETE",
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
    throw new PaymentsRequestError(
      readApiMessage(raw, "The payment ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new PaymentsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new PaymentsRequestError(
      "This payment record does not exist or has already been removed.",
      404
    );
  }
  if (response.status >= 500) {
    throw new PaymentsRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete payment."),
      response.status
    );
  }
  if (response.status !== 200) {
    throw new PaymentsRequestError(
      readApiMessage(
        raw,
        `Unable to delete this payment record. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  invalidatePaymentsCache();
  return readApiMessage(raw, DELETE_PAYMENT_SUCCESS);
}
