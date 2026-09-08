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
  "list",
  "content",
  "collection",
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

const NEST_KEYS = [
  "data",
  "result",
  "payload",
  "content",
  "body",
  "meta",
] as const;

function isObjectRowArray(value: unknown): value is unknown[] {
  return (
    Array.isArray(value) &&
    (value.length === 0 ||
      value.every(
        (item) => item && typeof item === "object" && !Array.isArray(item),
      ))
  );
}

export function extractListRows(raw: unknown): unknown[] {
  const seen = new Set<unknown>();

  const walk = (value: unknown, depth: number): unknown[] | null => {
    if (value == null || depth > 6 || seen.has(value)) {
      return null;
    }

    if (isObjectRowArray(value)) {
      return value;
    }

    const record = asRecord(value);
    if (!record) {
      return null;
    }
    seen.add(value);

    for (const key of ROW_KEYS) {
      const candidate = record[key];
      if (isObjectRowArray(candidate)) {
        return candidate;
      }
    }

    for (const key of NEST_KEYS) {
      const found = walk(record[key], depth + 1);
      if (found) {
        return found;
      }
    }

    return null;
  };

  return walk(raw, 0) ?? [];
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

/** Numeric ids stay numbers. UUID / Mongo ids are kept as the original string. */
export function pickEntityId(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const trimmed = value.trim();
      const asNumber = Number(trimmed);
      if (Number.isFinite(asNumber) && Number.isSafeInteger(asNumber)) {
        return asNumber;
      }
      return trimmed as unknown as number;
    }
  }
  return undefined;
}
