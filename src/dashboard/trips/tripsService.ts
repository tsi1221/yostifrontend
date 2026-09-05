import { TRIPS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateTripPayload,
  TripFieldErrors,
  TripFormValues,
  TripRecord,
  TripStatusValue,
  TripsListQuery,
  TripsListResponse,
} from "./types";
import { TRIP_STATUS_VALUES } from "./types";

export { isPreviewAccessToken };

export class TripsRequestError extends Error {
  status: number;
  fields?: TripFieldErrors;

  constructor(message: string, status: number, fields?: TripFieldErrors) {
    super(message);
    this.name = "TripsRequestError";
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

function pickText(...values: unknown[]) {
  const text = pickString(...values);
  if (text) {
    return text;
  }

  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  for (const value of values) {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
  }

  return "";
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

const FIELD_KEYS: Array<keyof CreateTripPayload> = [
  "arrivalCity",
  "duration",
  "hotel",
  "transport",
  "translator",
  "status",
];

function parseFieldErrors(raw: unknown): TripFieldErrors {
  const record = asRecord(raw);
  const message = record?.message;
  const fields: TripFieldErrors = {};
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

export function formatDuration(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/\d/.test(trimmed) && !/[a-zA-Z]/.test(trimmed)) {
    return `${trimmed} days`;
  }
  return trimmed;
}

export function asTripStatusValue(value: string): TripStatusValue {
  const match = TRIP_STATUS_VALUES.find((item) => item === value);
  return match ?? "planned";
}

export function validateTripForm(values: TripFormValues): TripFieldErrors {
  const errors: TripFieldErrors = {};
  if (!values.arrivalCity.trim()) {
    errors.arrivalCity = "Arrival city is required.";
  }
  if (!values.duration.trim()) {
    errors.duration = "Duration is required.";
  }
  if (!values.hotel.trim()) {
    errors.hotel = "Hotel is required.";
  }
  if (!values.transport.trim()) {
    errors.transport = "Transport is required.";
  }
  if (!values.translator.trim()) {
    errors.translator = "Translator is required.";
  }
  if (!TRIP_STATUS_VALUES.includes(values.status)) {
    errors.status = "Choose a valid trip status.";
  }
  return errors;
}

export function formValuesToPayload(values: TripFormValues): CreateTripPayload {
  return {
    arrivalCity: values.arrivalCity.trim(),
    duration: formatDuration(values.duration),
    hotel: values.hotel.trim(),
    transport: values.transport.trim(),
    translator: values.translator.trim(),
    status: values.status,
  };
}

export function formatTripStatus(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }
  if (trimmed === "Ongoing" || trimmed.toLowerCase() === "ongoing") {
    return "Ongoing";
  }
  if (trimmed.toLowerCase() === "planned") {
    return "Planned";
  }
  return trimmed;
}

export function buildTripsQueryString(query: TripsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.arrivalCity.trim()) {
    params.set("arrivalCity", query.arrivalCity.trim());
  }
  if (query.status) {
    params.set("status", query.status);
  }

  return params.toString();
}

export function normalizeTrip(raw: unknown): TripRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.tripId, record.trip_id);
  const arrivalCity = pickString(
    record.arrivalCity,
    record.arrival_city,
    record.destinationCity,
    record.destination_city,
    record.destination,
    record.city
  );
  if (id === undefined) {
    return null;
  }

  const user = asRecord(record.user);
  const duration = pickText(record.duration, record.durationDays, record.duration_days);

  return {
    id,
    userId:
      pickNumber(record.userId, record.user_id, user?.id, user?.userId, user?.user_id) ?? 0,
    arrivalCity,
    duration: formatDuration(duration) || duration,
    hotel: pickText(record.hotel, record.hotelBooking, record.hotel_booking),
    transport: pickText(record.transport, record.transportBooking, record.transport_booking),
    translator: pickText(record.translator),
    status: pickString(record.status) || "planned",
  };
}

function normalizeTripsResponse(
  raw: unknown,
  query: TripsListQuery
): TripsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.trips)
        ? record.trips
        : [];

  const data = rows
    .map((row) => normalizeTrip(row))
    .filter((row): row is TripRecord => Boolean(row));

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

export async function fetchTripsList(query: TripsListQuery): Promise<TripsListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new TripsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${TRIPS_URL}?${buildTripsQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new TripsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new TripsRequestError(readApiMessage(raw, "Invalid trip filters."), 400);
  }
  if (response.status === 401) {
    throw new TripsRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new TripsRequestError(
      readApiMessage(raw, "The server could not load trips."),
      response.status
    );
  }
  if (!response.ok) {
    throw new TripsRequestError(
      readApiMessage(raw, `Unable to load trips. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeTripsResponse(raw, query);
}

export const TRIPS_INVALIDATE_EVENT = "yosti:trips-invalidate";

export function invalidateTripsCache() {
  window.dispatchEvent(new CustomEvent(TRIPS_INVALIDATE_EVENT));
}

export function tripsUrl() {
  return TRIPS_URL;
}

export async function createTrip(payload: CreateTripPayload): Promise<TripRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new TripsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(TRIPS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new TripsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new TripsRequestError(
      readApiMessage(raw, "Unable to create this trip. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new TripsRequestError("Unauthorized", 401);
  }
  if (response.status === 409) {
    throw new TripsRequestError(
      "A duplicate trip record already exists for this destination with the same status.",
      409
    );
  }
  if (response.status >= 500) {
    throw new TripsRequestError(
      readApiMessage(raw, "Server error occurred. Could not create trip."),
      response.status
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new TripsRequestError(
      readApiMessage(raw, `Unable to create trip. Server returned ${response.status}.`),
      response.status
    );
  }

  const created =
    normalizeTrip(raw) ??
    normalizeTrip(asRecord(raw)?.data) ??
    normalizeTrip(asRecord(raw)?.trip);

  if (!created) {
    throw new TripsRequestError("The server returned an incomplete trip.", 500);
  }

  invalidateTripsCache();
  return created;
}
