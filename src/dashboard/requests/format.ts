import { BADGE_TONE_CLASS, type StatusTone } from "../statusStyles";

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
