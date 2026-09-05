import { INSPECTIONS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateInspectionPayload,
  InspectionFieldErrors,
  InspectionFormValues,
  InspectionRecord,
  InspectionsListQuery,
  InspectionsListResponse,
  InspectionUpdateTypeValue,
  UpdateInspectionFormValues,
  UpdateInspectionPayload,
} from "./types";
import { INSPECTION_TYPE_VALUES, INSPECTION_UPDATE_TYPE_VALUES } from "./types";

export { isPreviewAccessToken };

export class InspectionsRequestError extends Error {
  status: number;
  fields?: InspectionFieldErrors;

  constructor(message: string, status: number, fields?: InspectionFieldErrors) {
    super(message);
    this.name = "InspectionsRequestError";
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

function pickBoolean(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }
    if (value === "true" || value === "1" || value === 1) {
      return true;
    }
    if (value === "false" || value === "0" || value === 0) {
      return false;
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

const FIELD_KEYS: Array<keyof CreateInspectionPayload> = [
  "supplierId",
  "productType",
  "type",
  "date",
  "photoVideoRequired",
];

function parseFieldErrors(raw: unknown): InspectionFieldErrors {
  const record = asRecord(raw);
  const message = record?.message;
  const fields: InspectionFieldErrors = {};
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

export function parseSupplierId(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return undefined;
  }
  const id = Number.parseInt(trimmed, 10);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

export function localDateTimeToIso(value: string): string {
  if (!value.trim()) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

export function validateInspectionForm(
  values: InspectionFormValues
): InspectionFieldErrors {
  const errors: InspectionFieldErrors = {};
  if (parseSupplierId(values.supplierId) === undefined) {
    errors.supplierId = "Enter a valid numeric supplier ID.";
  }
  if (!values.productType.trim()) {
    errors.productType = "Product type is required.";
  }
  if (!INSPECTION_TYPE_VALUES.includes(values.type)) {
    errors.type = "Choose a valid inspection type.";
  }
  if (!localDateTimeToIso(values.date)) {
    errors.date = "Choose a valid date and time.";
  }
  return errors;
}

export function formValuesToPayload(
  values: InspectionFormValues
): CreateInspectionPayload {
  return {
    supplierId: parseSupplierId(values.supplierId) ?? 0,
    productType: values.productType.trim(),
    type: values.type,
    date: localDateTimeToIso(values.date),
    photoVideoRequired: Boolean(values.photoVideoRequired),
  };
}

export function isoToLocalDateTime(value: string): string {
  if (!value.trim()) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function asUpdateInspectionType(value: string): InspectionUpdateTypeValue {
  return value.trim().toLowerCase() === "factory visit"
    ? "factory visit"
    : "Preshipment";
}

export function inspectionToFormValues(
  inspection: InspectionRecord
): UpdateInspectionFormValues {
  return {
    supplierId: String(inspection.supplierId),
    productType: inspection.productType,
    type: asUpdateInspectionType(inspection.type),
    date: isoToLocalDateTime(inspection.date),
    photoVideoRequired: Boolean(inspection.photoVideoRequired),
  };
}

export function validateUpdateInspectionForm(
  values: UpdateInspectionFormValues
): InspectionFieldErrors {
  const errors: InspectionFieldErrors = {};
  if (parseSupplierId(values.supplierId) === undefined) {
    errors.supplierId = "Enter a valid numeric supplier ID.";
  }
  if (!values.productType.trim()) {
    errors.productType = "Product type is required.";
  }
  if (!INSPECTION_UPDATE_TYPE_VALUES.includes(values.type)) {
    errors.type = "Choose Preshipment or factory visit.";
  }
  if (!localDateTimeToIso(values.date)) {
    errors.date = "Choose a valid date and time.";
  }
  return errors;
}

export function updateFormValuesToPayload(
  values: UpdateInspectionFormValues
): UpdateInspectionPayload {
  return {
    supplierId: parseSupplierId(values.supplierId) ?? Number.parseInt(values.supplierId, 10),
    productType: values.productType.trim(),
    type: values.type,
    date: localDateTimeToIso(values.date),
    photoVideoRequired: Boolean(values.photoVideoRequired),
  };
}

function asInspectionType(value: string): string {
  const match = INSPECTION_TYPE_VALUES.find((item) => item === value);
  return match ?? value;
}

export function formatInspectionType(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "—";
  }
  if (trimmed.toLowerCase() === "factory visit") {
    return "Factory Visit";
  }
  return trimmed;
}

export function formatInspectionDate(value: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const timePart = `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;

  return `${datePart} - ${timePart}`;
}

export function parseInspectionId(value: string | undefined): number | undefined {
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

export function filterDateToIso(value: string) {
  if (!value.trim()) {
    return "";
  }
  const date = new Date(`${value.trim()}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString();
}

export function buildInspectionsQueryString(query: InspectionsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.type) {
    params.set("type", query.type);
  }
  if (query.productType.trim()) {
    params.set("productType", query.productType.trim());
  }
  if (query.photoVideoRequired) {
    params.set("photoVideoRequired", query.photoVideoRequired);
  }
  const date = filterDateToIso(query.date);
  if (date) {
    params.set("date", date);
  }

  return params.toString();
}

function normalizeInspectionsResponse(
  raw: unknown,
  query: InspectionsListQuery
): InspectionsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.inspections)
        ? record.inspections
        : [];

  const data = rows
    .map((row) => normalizeInspection(row))
    .filter((row): row is InspectionRecord => Boolean(row));

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

export async function fetchInspectionsList(
  query: InspectionsListQuery
): Promise<InspectionsListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${INSPECTIONS_URL}?${buildInspectionsQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new InspectionsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "Invalid inspection filters."),
      400
    );
  }
  if (response.status === 401) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "The server could not load inspections."),
      response.status
    );
  }
  if (!response.ok) {
    throw new InspectionsRequestError(
      readApiMessage(raw, `Unable to load inspections. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeInspectionsResponse(raw, query);
}

export function normalizeInspection(raw: unknown): InspectionRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.inspectionId, record.inspection_id);
  const supplierId = pickNumber(record.supplierId, record.supplier_id);
  if (id === undefined || supplierId === undefined) {
    return null;
  }

  return {
    id,
    userId: pickNumber(record.userId, record.user_id) ?? 0,
    supplierId,
    productType: pickString(record.productType, record.product_type),
    type: asInspectionType(pickString(record.type, record.inspectionType, record.inspection_type)),
    date: pickString(record.date, record.scheduledDate, record.scheduled_date),
    photoVideoRequired:
      pickBoolean(
        record.photoVideoRequired,
        record.photo_video_required,
        record.mediaRequired
      ) ?? false,
  };
}

export const INSPECTIONS_INVALIDATE_EVENT = "yosti:inspections-invalidate";

export function invalidateInspectionsCache() {
  window.dispatchEvent(new CustomEvent(INSPECTIONS_INVALIDATE_EVENT));
}

export function inspectionsUrl() {
  return INSPECTIONS_URL;
}

export function inspectionDetailUrl(id: number) {
  return `${INSPECTIONS_URL}/${id}`;
}

export async function fetchInspection(id: number): Promise<InspectionRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new InspectionsRequestError(
      "This inspection request could not be found or has been removed.",
      404
    );
  }

  let response: Response;
  try {
    response = await fetch(inspectionDetailUrl(id), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new InspectionsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "The inspection ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new InspectionsRequestError(
      "This inspection request could not be found or has been removed.",
      404
    );
  }
  if (response.status >= 500) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "The server could not load this inspection request."),
      response.status
    );
  }
  if (!response.ok) {
    throw new InspectionsRequestError(
      readApiMessage(
        raw,
        `Unable to load this inspection request. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  const record = asRecord(raw);
  const payload =
    normalizeInspection(raw) ??
    normalizeInspection(record?.data) ??
    normalizeInspection(record?.inspection);

  if (!payload) {
    throw new InspectionsRequestError(
      "The server returned an incomplete inspection request.",
      500
    );
  }

  return payload;
}

export async function createInspection(
  payload: CreateInspectionPayload
): Promise<InspectionRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(INSPECTIONS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new InspectionsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "Unable to create this inspection. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "Server error occurred. Could not create inspection."),
      response.status
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new InspectionsRequestError(
      readApiMessage(raw, `Unable to create inspection. Server returned ${response.status}.`),
      response.status
    );
  }

  const created =
    normalizeInspection(raw) ??
    normalizeInspection(asRecord(raw)?.data) ??
    normalizeInspection(asRecord(raw)?.inspection);

  if (!created) {
    throw new InspectionsRequestError("The server returned an incomplete inspection.", 500);
  }

  invalidateInspectionsCache();
  return created;
}

export async function patchInspection(
  id: number,
  payload: UpdateInspectionPayload
): Promise<InspectionRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new InspectionsRequestError("The inspection ID is invalid.", 400);
  }

  let response: Response;
  try {
    response = await fetch(inspectionDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new InspectionsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "Unable to save this inspection. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new InspectionsRequestError(
      "This inspection could not be found or has been removed.",
      404
    );
  }
  if (response.status >= 500) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "Server error occurred. Could not update inspection."),
      response.status
    );
  }
  if (!response.ok) {
    throw new InspectionsRequestError(
      readApiMessage(raw, `Unable to update inspection. Server returned ${response.status}.`),
      response.status
    );
  }

  const updated =
    normalizeInspection(raw) ??
    normalizeInspection(asRecord(raw)?.data) ??
    normalizeInspection(asRecord(raw)?.inspection);

  if (!updated) {
    throw new InspectionsRequestError("The server returned an incomplete inspection.", 500);
  }

  invalidateInspectionsCache();
  return updated;
}

const DELETE_INSPECTION_SUCCESS =
  "Inspection request deleted successfully.";

export async function deleteInspection(id: number): Promise<string> {
  const token = getAccessToken();
  if (!token) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }

  if (!Number.isInteger(id) || id <= 0) {
    throw new InspectionsRequestError(
      "The inspection ID format is invalid.",
      400
    );
  }

  let response: Response;
  try {
    response = await fetch(inspectionDetailUrl(id), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new InspectionsRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "The inspection ID format is invalid."),
      400
    );
  }
  if (response.status === 401) {
    throw new InspectionsRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new InspectionsRequestError(
      "This inspection request does not exist or has already been removed.",
      404
    );
  }
  if (response.status >= 500) {
    throw new InspectionsRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete inspection."),
      response.status
    );
  }
  if (response.status !== 200) {
    throw new InspectionsRequestError(
      readApiMessage(
        raw,
        `Unable to delete this inspection request. Server returned ${response.status}.`
      ),
      response.status
    );
  }

  invalidateInspectionsCache();
  return readApiMessage(raw, DELETE_INSPECTION_SUCCESS);
}
