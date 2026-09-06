function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

const ROW_KEYS = [
  "data",
  "items",
  "rows",
  "results",
  "records",
  "result",
  "users",
  "roles",
  "permissions",
  "requests",
  "shipments",
  "services",
  "blogs",
  "projects",
  "contacts",
  "tickets",
  "supports",
  "trips",
  "payments",
  "inspections",
] as const;

export function extractListRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  const record = asRecord(raw);
  if (!record) {
    return [];
  }

  const nested =
    asRecord(record.data) ??
    asRecord(record.result) ??
    asRecord(record.payload) ??
    asRecord(record.meta);

  for (const key of ROW_KEYS) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  if (nested) {
    for (const key of ROW_KEYS) {
      const value = nested[key];
      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return [];
}

export function pickListNumber(...values: unknown[]) {
  for (const value of values) {
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }
  return undefined;
}
