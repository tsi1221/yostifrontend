import { TRIPS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateTripPayload,
  TripFieldErrors,
  TripFormValues,
  TripRecord,
  TripStatusValue,
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

function normalizeTrip(raw: unknown): TripRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.tripId, record.trip_id);
  const arrivalCity = pickString(
    record.arrivalCity,
    record.arrival_city,
    record.destination
  );
  if (id === undefined) {
    return null;
  }

  return {
    id,
    userId: pickNumber(record.userId, record.user_id) ?? 0,
    arrivalCity,
    duration: pickString(record.duration, record.durationDays, record.duration_days),
    hotel: pickString(record.hotel, record.hotelBooking, record.hotel_booking),
    transport: pickString(record.transport),
    translator: pickString(record.translator),
    status: pickString(record.status) || "planned",
  };
}

export const TRIPS_INVALIDATE_EVENT = "yosti:trips-invalidate";

export function invalidateTripsCache() {
  window.dispatchEvent(new CustomEvent(TRIPS_INVALIDATE_EVENT));
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
