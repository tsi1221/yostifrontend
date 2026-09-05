import { SHIPMENTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateShipmentPayload,
  ShipmentFieldErrors,
  ShipmentFormValues,
  ShipmentRecord,
  ShipmentsListQuery,
  ShipmentsListResponse,
} from "./types";

export { isPreviewAccessToken };

export class ShipmentsRequestError extends Error {
  status: number;
  fields?: ShipmentFieldErrors;

  constructor(message: string, status: number, fields?: ShipmentFieldErrors) {
    super(message);
    this.name = "ShipmentsRequestError";
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

const FIELD_KEYS: Array<keyof CreateShipmentPayload> = [
  "pickupLocation",
  "destinationCountry",
  "city",
  "destinationDescription",
  "weight",
  "volumeM3",
  "method",
];

function parseFieldErrors(raw: unknown): ShipmentFieldErrors {
  const record = asRecord(raw);
  const message = record?.message;
  const fields: ShipmentFieldErrors = {};
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

export function formatWeight(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/\d/.test(trimmed) && !/[a-zA-Z]/.test(trimmed)) {
    return `${trimmed} kg`;
  }
  return trimmed;
}

export function formatVolume(value: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "";
  }
  return String(number);
}

export function validateShipmentForm(values: ShipmentFormValues): ShipmentFieldErrors {
  const errors: ShipmentFieldErrors = {};
  if (!values.pickupLocation.trim()) {
    errors.pickupLocation = "Pickup location is required.";
  }
  if (!values.destinationCountry.trim()) {
    errors.destinationCountry = "Destination country is required.";
  }
  if (!values.city.trim()) {
    errors.city = "City is required.";
  }
  if (!values.destinationDescription.trim()) {
    errors.destinationDescription = "Destination notes are required.";
  }
  if (!values.weight.trim()) {
    errors.weight = "Weight is required.";
  }
  if (!values.volumeM3.trim() || !Number.isFinite(Number(values.volumeM3))) {
    errors.volumeM3 = "Enter volume in cubic meters.";
  }
  if (values.method !== "Air" && values.method !== "Sea") {
    errors.method = "Choose Air or Sea.";
  }
  return errors;
}

export function formValuesToPayload(values: ShipmentFormValues): CreateShipmentPayload {
  return {
    pickupLocation: values.pickupLocation.trim(),
    destinationCountry: values.destinationCountry.trim(),
    city: values.city.trim(),
    destinationDescription: values.destinationDescription.trim(),
    weight: formatWeight(values.weight),
    volumeM3: formatVolume(values.volumeM3),
    method: values.method,
  };
}

function normalizeShipment(raw: unknown): ShipmentRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.shipmentId, record.shipment_id);
  const pickupLocation = pickString(
    record.pickupLocation,
    record.pickup_location
  );
  if (id === undefined) {
    return null;
  }

  return {
    id,
    userId: pickNumber(record.userId, record.user_id) ?? 0,
    pickupLocation,
    destinationCountry: pickString(
      record.destinationCountry,
      record.destination_country
    ),
    city: pickString(record.city),
    destinationDescription: pickString(
      record.destinationDescription,
      record.destination_description
    ),
    weight: pickString(record.weight),
    volumeM3: pickNumber(record.volumeM3, record.volume_m3, record.volume) ?? 0,
    method: pickString(record.method, record.shipping_method) || "Air",
  };
}

export const SHIPMENTS_INVALIDATE_EVENT = "yosti:shipments-invalidate";

export function invalidateShipmentsCache() {
  window.dispatchEvent(new CustomEvent(SHIPMENTS_INVALIDATE_EVENT));
}

export function buildShipmentsQueryString(query: ShipmentsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.method) {
    params.set("method", query.method);
  }
  if (query.destinationCountry.trim()) {
    params.set("destinationCountry", query.destinationCountry.trim());
  }

  return params.toString();
}

function normalizeShipmentsResponse(
  raw: unknown,
  query: ShipmentsListQuery
): ShipmentsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.shipments)
        ? record.shipments
        : [];

  const data = rows
    .map((row) => normalizeShipment(row))
    .filter((row): row is ShipmentRecord => Boolean(row));

  const total = pickNumber(record?.total, nested?.total) ?? data.length;
  const page = pickNumber(record?.page, nested?.page) ?? query.page;
  const pageSize =
    pickNumber(record?.pageSize, record?.limit, nested?.pageSize) ?? query.pageSize;
  const totalPages =
    pickNumber(record?.totalPages, record?.total_pages, nested?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return { data, total, page, pageSize, totalPages };
}

export async function fetchShipmentsList(
  query: ShipmentsListQuery
): Promise<ShipmentsListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new ShipmentsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${SHIPMENTS_URL}?${buildShipmentsQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ShipmentsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ShipmentsRequestError(
      readApiMessage(raw, "Invalid shipment filters."),
      400
    );
  }
  if (response.status === 401) {
    throw new ShipmentsRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new ShipmentsRequestError(
      readApiMessage(raw, "The server could not load shipments."),
      response.status
    );
  }
  if (!response.ok) {
    throw new ShipmentsRequestError(
      readApiMessage(raw, `Unable to load shipments. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeShipmentsResponse(raw, query);
}

export async function createShipment(
  payload: CreateShipmentPayload
): Promise<ShipmentRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new ShipmentsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(SHIPMENTS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ShipmentsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ShipmentsRequestError(
      readApiMessage(raw, "Unable to create this shipment. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new ShipmentsRequestError("Unauthorized", 401);
  }
  if (response.status === 409) {
    throw new ShipmentsRequestError(
      "An identical shipment already exists for your account. Please verify details before trying again.",
      409
    );
  }
  if (response.status >= 500) {
    throw new ShipmentsRequestError(
      readApiMessage(raw, "Server error occurred. Could not create shipment."),
      response.status
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new ShipmentsRequestError(
      readApiMessage(raw, `Unable to create shipment. Server returned ${response.status}.`),
      response.status
    );
  }

  const created =
    normalizeShipment(raw) ??
    normalizeShipment(asRecord(raw)?.data) ??
    normalizeShipment(asRecord(raw)?.shipment);

  if (!created) {
    throw new ShipmentsRequestError("The server returned an incomplete shipment.", 500);
  }

  invalidateShipmentsCache();
  return created;
}
