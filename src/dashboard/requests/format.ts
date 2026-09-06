import { BADGE_TONE_CLASS, type StatusTone } from "../statusStyles";
import { deadlineToIso } from "./requestsService";
import type { RequestFormValues, RequestRegion, RequestUpdatePayload, SourcingRequestRecord } from "./types";
import { REQUEST_REGIONS } from "./types";

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDeadline(value: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimestamp(value: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function requestStatusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();
  if (normalized === "open" || normalized === "completed") {
    return "green";
  }
  if (normalized === "quoted" || normalized === "pending") {
    return "yellow";
  }
  if (normalized === "closed" || normalized === "rejected" || normalized === "cancelled") {
    return "red";
  }
  return "navy";
}

export function requestStatusClass(status: string) {
  return BADGE_TONE_CLASS[requestStatusTone(status)];
}

export function isoToDateInput(iso: string) {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

export function dateInputToIso(dateValue: string, originalIso = "") {
  if (!dateValue) {
    return "";
  }
  if (originalIso && isoToDateInput(originalIso) === dateValue) {
    return originalIso;
  }
  return deadlineToIso(dateValue);
}

export function requestToFormValues(request: SourcingRequestRecord): RequestFormValues {
  const region = REQUEST_REGIONS.includes(request.supplierRegion as RequestRegion)
    ? (request.supplierRegion as RequestRegion)
    : "Yiwu";

  return {
    productName: request.productName,
    description: request.description,
    quantity: String(request.quantity),
    targetPrice: request.targetPrice.toFixed(2),
    supplierRegion: region,
    deadline: isoToDateInput(request.deadline),
    status: request.status,
  };
}

export function formValuesToPayload(
  values: RequestFormValues,
  original?: SourcingRequestRecord
): RequestUpdatePayload {
  return {
    productName: values.productName.trim(),
    description: values.description.trim(),
    quantity: Number(values.quantity),
    targetPrice: Number(values.targetPrice).toFixed(2),
    supplierRegion: values.supplierRegion,
    deadline: dateInputToIso(values.deadline, original?.deadline),
    status: values.status,
  };
}
