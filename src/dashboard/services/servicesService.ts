import { SERVICES_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateServicePayload,
  CreateServiceResult,
  ServiceDetails,
  ServiceFieldErrors,
  ServiceFormValues,
  ServiceRecord,
  ServiceTierValue,
  ServicesListQuery,
  ServicesListResponse,
  UpdateServicePayload,
} from "./types";
import { SERVICE_TIER_VALUES } from "./types";

export { isPreviewAccessToken };

export class ServiceRequestError extends Error {
  status: number;
  fields?: ServiceFieldErrors;

  constructor(message: string, status: number, fields?: ServiceFieldErrors) {
    super(message);
    this.name = "ServiceRequestError";
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
    if (value === 1 || value === "1" || value === "true") {
      return true;
    }
    if (value === 0 || value === "0" || value === "false") {
      return false;
    }
  }
  return false;
}

function pickStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
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

const FIELD_KEYS: Array<keyof ServiceFieldErrors> = [
  "title",
  "logo",
  "tier",
  "support247",
  "features",
  "details",
];

function assignFieldError(fields: ServiceFieldErrors, key: string, value: string) {
  const normalized = key.replace(/^details[._]/, "") as keyof ServiceFieldErrors;
  if (FIELD_KEYS.includes(normalized) && value) {
    fields[normalized] = value;
  }
}

function parseFieldErrors(raw: unknown): ServiceFieldErrors {
  const record = asRecord(raw);
  const fields: ServiceFieldErrors = {};
  const message = record?.message;
  const nested =
    asRecord(record?.fields) ?? asRecord(message) ?? asRecord(record?.errors);
  const details = asRecord(nested?.details) ?? asRecord(record?.details);

  if (nested) {
    for (const key of Object.keys(nested)) {
      assignFieldError(fields, key, pickString(nested[key]));
    }
  }

  if (details) {
    for (const key of ["tier", "support247", "features"] as const) {
      const value = pickString(details[key]);
      if (value && !fields[key]) {
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

export function collectedFeatures(values: ServiceFormValues) {
  return values.features.map((feature) => feature.trim()).filter(Boolean);
}

export function validateServiceForm(values: ServiceFormValues): ServiceFieldErrors {
  const errors: ServiceFieldErrors = {};
  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.logo.trim()) {
    errors.logo = "Logo URL is required.";
  } else if (!isHttpUrl(values.logo.trim())) {
    errors.logo = "Enter a valid http(s) logo URL.";
  }
  if (!SERVICE_TIER_VALUES.includes(values.tier as ServiceTierValue)) {
    errors.tier = "Choose a service tier.";
  }
  if (collectedFeatures(values).length === 0) {
    errors.features = "Add at least one feature.";
  }
  return errors;
}

export function formValuesToPayload(values: ServiceFormValues): CreateServicePayload {
  return {
    title: values.title.trim(),
    logo: values.logo.trim(),
    details: {
      tier: values.tier,
      support247: values.support247,
      features: collectedFeatures(values),
    },
  };
}

export function normalizeService(raw: unknown): ServiceRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.serviceId, record.service_id);
  if (id === undefined) {
    return null;
  }

  const detailsRecord = asRecord(record.details);
  const details: ServiceDetails = {
    tier: pickString(detailsRecord?.tier, record.tier),
    support247: pickBoolean(
      detailsRecord?.support247,
      detailsRecord?.support_247,
      record.support247,
      record.support_247
    ),
    features: pickStringArray(detailsRecord?.features ?? record.features),
  };

  return {
    id,
    title: pickString(record.title, record.name),
    logo: pickString(record.logo, record.logoUrl, record.logo_url),
    details,
  };
}

export const SERVICE_TITLE_CONFLICT_MESSAGE =
  "A service with this title already exists.";

export const SERVICE_TITLE_TAKEN_MESSAGE = "This title is already taken";

export const SERVICE_NOT_FOUND_MESSAGE = "Service not found.";

export const CREATE_SERVICE_SUCCESS_MESSAGE = "Service created successfully.";

export const UPDATE_SERVICE_SUCCESS_MESSAGE = "Service updated successfully.";

export function asServiceId(value: unknown): number | undefined {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}

export function serviceDetailUrl(id: number) {
  return `${SERVICES_URL}/${id}`;
}

export function serviceToFormValues(service: ServiceRecord): ServiceFormValues {
  const features = service.details.features.length > 0 ? service.details.features : [""];
  const tier = SERVICE_TIER_VALUES.includes(service.details.tier as ServiceTierValue)
    ? (service.details.tier as ServiceTierValue)
    : "";
  return {
    title: service.title,
    logo: service.logo,
    tier,
    support247: service.details.support247,
    features,
  };
}

export function formValuesToUpdatePayload(values: ServiceFormValues): UpdateServicePayload {
  return formValuesToPayload(values);
}

export const SERVICES_INVALIDATE_EVENT = "yosti:services-invalidate";

export function invalidateServicesCache() {
  window.dispatchEvent(new CustomEvent(SERVICES_INVALIDATE_EVENT));
}

function serviceFromResponse(raw: unknown): ServiceRecord | null {
  return (
    normalizeService(raw) ??
    normalizeService(asRecord(raw)?.data) ??
    normalizeService(asRecord(raw)?.service)
  );
}

export async function createService(
  payload: CreateServicePayload
): Promise<CreateServiceResult> {
  const token = getAccessToken();
  if (!token) {
    throw new ServiceRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(SERVICES_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ServiceRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ServiceRequestError(
      readApiMessage(raw, "Unable to create this service. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new ServiceRequestError("Unauthorized", 401);
  }
  if (response.status === 409) {
    throw new ServiceRequestError(SERVICE_TITLE_CONFLICT_MESSAGE, 409);
  }
  if (response.status >= 500) {
    throw new ServiceRequestError(
      readApiMessage(raw, "Server error occurred. Could not create service."),
      response.status
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new ServiceRequestError(
      readApiMessage(raw, `Unable to create this service. Server returned ${response.status}.`),
      response.status
    );
  }

  const created = serviceFromResponse(raw);
  if (!created) {
    throw new ServiceRequestError("The server returned an incomplete service.", 500);
  }

  invalidateServicesCache();
  return {
    record: created,
    message: readApiMessage(raw, CREATE_SERVICE_SUCCESS_MESSAGE),
  };
}

export function buildServicesQueryString(query: ServicesListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.title.trim()) {
    params.set("title", query.title.trim());
  }

  return params.toString();
}

function normalizeServicesResponse(
  raw: unknown,
  query: ServicesListQuery
): ServicesListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.services)
        ? record.services
        : [];

  const data = rows
    .map((row) => normalizeService(row))
    .filter((row): row is ServiceRecord => Boolean(row));

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

export async function fetchServicesList(
  query: ServicesListQuery
): Promise<ServicesListResponse> {
  const token = getAccessToken();
  if (!token) {
    throw new ServiceRequestError("Unauthorized", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${SERVICES_URL}?${buildServicesQueryString(query)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ServiceRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ServiceRequestError(
      readApiMessage(raw, "Invalid service filters."),
      400
    );
  }
  if (response.status === 401) {
    throw new ServiceRequestError("Unauthorized", 401);
  }
  if (response.status >= 500) {
    throw new ServiceRequestError(
      readApiMessage(raw, "The server could not load services."),
      response.status
    );
  }
  if (!response.ok) {
    throw new ServiceRequestError(
      readApiMessage(raw, `Unable to load services. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeServicesResponse(raw, query);
}

export async function patchService(
  id: number,
  payload: UpdateServicePayload
): Promise<ServiceRecord> {
  const token = getAccessToken();
  if (!token) {
    throw new ServiceRequestError("Unauthorized", 401);
  }

  if (asServiceId(id) === undefined) {
    throw new ServiceRequestError(SERVICE_NOT_FOUND_MESSAGE, 404);
  }

  let response: Response;
  try {
    response = await fetch(serviceDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ServiceRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ServiceRequestError(
      readApiMessage(raw, "Unable to save this service. Check the highlighted fields."),
      400,
      parseFieldErrors(raw)
    );
  }
  if (response.status === 401) {
    throw new ServiceRequestError("Unauthorized", 401);
  }
  if (response.status === 404) {
    throw new ServiceRequestError(SERVICE_NOT_FOUND_MESSAGE, 404);
  }
  if (response.status === 409) {
    throw new ServiceRequestError(SERVICE_TITLE_TAKEN_MESSAGE, 409, {
      title: SERVICE_TITLE_TAKEN_MESSAGE,
    });
  }
  if (response.status >= 500) {
    throw new ServiceRequestError(
      readApiMessage(raw, "Server error occurred. Could not update service."),
      response.status
    );
  }
  if (!response.ok) {
    throw new ServiceRequestError(
      readApiMessage(raw, `Unable to update this service. Server returned ${response.status}.`),
      response.status
    );
  }

  const updated = serviceFromResponse(raw);
  if (!updated) {
    throw new ServiceRequestError("The server returned an incomplete service.", 500);
  }

  invalidateServicesCache();
  return updated;
}
