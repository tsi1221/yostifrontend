import type { AuthLoginRequest, AuthLoginResponse, AuthUser } from "../types/auth";

export const AUTH_LOGIN_URL = "https://yosti.nedhigibe.com/api/auth/login";

function readApiMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const message = (data as { message?: string | string[] }).message;
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallback;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }
  const user = value as Partial<AuthUser>;
  return (
    typeof user.id === "number" &&
    typeof user.fullname === "string" &&
    typeof user.email === "string" &&
    typeof user.roleId === "number"
  );
}

function isLoginPayload(value: unknown): value is AuthLoginResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const payload = value as Partial<AuthLoginResponse>;
  return typeof payload.access_token === "string" && isAuthUser(payload.user);
}

export async function loginWithPassword(
  credentials: AuthLoginRequest
): Promise<AuthLoginResponse> {
  const response = await fetch(AUTH_LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(
      readApiMessage(data, "Invalid email or password.")
    );
  }

  if (!isLoginPayload(data)) {
    throw new Error("Login succeeded, but the auth payload was incomplete.");
  }

  return data;
}
