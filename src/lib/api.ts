import axios, { type AxiosError } from "axios";

import { getAccessToken } from "../dashboard/auth/session";
import { sanitizeApiMessage } from "../dashboard/apiMessage";
import {
  expireSession,
  FORBIDDEN_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
} from "../dashboard/auth/sessionExpiry";

const DEFAULT_API_BASE = "https://yosti.nedhigibe.com/api";

function resolveApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL;
  const raw =
    typeof fromEnv === "string" && fromEnv.trim()
      ? fromEnv.trim()
      : DEFAULT_API_BASE;
  return raw.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBase();

function isAuthRoute(url?: string) {
  if (!url) {
    return false;
  }
  return /\/auth\/(login|register)\b/i.test(url);
}

function messageFromPayload(data: unknown) {
  if (!data || typeof data !== "object") {
    return "";
  }
  const message = (data as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const text = message
      .filter((item) => typeof item === "string")
      .join(", ");
    if (text.trim()) {
      return text.trim();
    }
  }
  return "";
}

function messageForStatus(status?: number) {
  switch (status) {
    case 401:
      return SESSION_EXPIRED_MESSAGE;
    case 403:
      return FORBIDDEN_MESSAGE;
    case 404:
      return "We couldn't find that information.";
    case 422:
      return "Please correct the highlighted fields.";
    case 500:
      return "Something went wrong. Please try again.";
    default:
      return "";
  }
}

export function readApiError(
  error: unknown,
  fallback = "We couldn't complete that request. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const fromBody = messageFromPayload(error.response?.data);
    if (fromBody) {
      return sanitizeApiMessage(fromBody, fallback);
    }
    const fromStatus = messageForStatus(error.response?.status);
    if (fromStatus) {
      return fromStatus;
    }
    if (
      error.message &&
      error.message !== "Network Error" &&
      !/status code/i.test(error.message)
    ) {
      return sanitizeApiMessage(error.message, fallback);
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return sanitizeApiMessage(error.message, fallback);
  }
  return fallback;
}

export function getApiStatus(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.status ?? 0;
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status: unknown }).status);
    return Number.isFinite(status) ? status : 0;
  }
  return 0;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? error.config?.baseURL ?? "");
    if (status === 401 && !isAuthRoute(url)) {
      expireSession();
    }
    return Promise.reject(error);
  },
);

export default api;
