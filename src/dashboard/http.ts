import api from "../lib/api";
import { getAccessToken } from "./auth/session";

export interface JsonResult {
  ok: boolean;
  status: number;
  data: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function readJsonMessage(data: unknown, fallback: string) {
  const record = asRecord(data);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string").join(", ");
    if (text.trim()) {
      return text.trim();
    }
  }
  return fallback;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export function buildListQueryVariants(
  page: number,
  pageSize: number,
  extra: Record<string, string | number | boolean | undefined | ""> = {},
) {
  const extras = new URLSearchParams();
  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined || value === "") {
      continue;
    }
    extras.set(key, String(value));
  }
  const extraText = extras.toString();
  const suffix = extraText ? `&${extraText}` : "";
  const currentPage = String(page || 1);
  const size = String(pageSize || 10);

  return unique([
    `page=${currentPage}&pageSize=${size}${suffix}`,
    `page=${currentPage}&limit=${size}${suffix}`,
    extraText,
    "",
  ]);
}

export async function fetchAuthorizedJson(
  url: string,
  init?: RequestInit,
  options?: { requireAuth?: boolean },
): Promise<JsonResult> {
  if (!getAccessToken() && options?.requireAuth !== false) {
    return { ok: false, status: 401, data: { message: "Unauthorized" } };
  }

  try {
    const method = (init?.method || "GET").toUpperCase();
    const response = await api.request({
      url,
      method,
      data: init?.body,
      headers: init?.headers as Record<string, string> | undefined,
      validateStatus: () => true,
    });
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: {
        message:
          "Unable to reach the server. Check your connection and try again.",
      },
    };
  }
}

export async function fetchAuthorizedList(
  baseUrl: string,
  queryVariants: string[],
  options?: { requireAuth?: boolean },
): Promise<JsonResult> {
  let last: JsonResult = {
    ok: false,
    status: 0,
    data: {
      message:
        "Unable to reach the server. Check your connection and try again.",
    },
  };

  for (const query of queryVariants) {
    const url = query ? `${baseUrl}?${query}` : baseUrl;
    last = await fetchAuthorizedJson(url, undefined, options);
    if (
      last.ok ||
      last.status === 0 ||
      last.status === 401 ||
      last.status === 403 ||
      (last.status !== 400 && last.status !== 422)
    ) {
      return last;
    }
  }

  return last;
}
