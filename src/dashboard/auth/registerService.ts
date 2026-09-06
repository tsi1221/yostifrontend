import type {
  AuthRegisterRequest,
  AuthRegisterResponse,
  RegisterRole,
} from "../types/auth";
import { AUTH_REGISTER_URL } from "./endpoints";

export const REGISTER_ROLE_OPTIONS: {
  label: string;
  role: RegisterRole;
  roleId: number;
}[] = [
  { label: "Buyer", role: "Buyer", roleId: 1 },
  { label: "Supplier", role: "Supplier", roleId: 2 },
  { label: "Logistics Partner", role: "Logistics Partner", roleId: 3 },
];

export class AuthRequestError extends Error {
  status: number;
  field?: "email";

  constructor(message: string, status: number, field?: "email") {
    super(message);
    this.name = "AuthRequestError";
    this.status = status;
    this.field = field;
  }
}

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

export function roleIdForRole(role: RegisterRole) {
  return (
    REGISTER_ROLE_OPTIONS.find((option) => option.role === role)?.roleId ?? 1
  );
}

export async function registerAccount(
  payload: AuthRegisterRequest
): Promise<AuthRegisterResponse> {
  let response: Response;

  try {
    response = await fetch(AUTH_REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthRequestError(
      "Unable to connect to the server. Check your connection and try again.",
      0
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (response.status === 409) {
    throw new AuthRequestError(
      "This email address is already registered.",
      409,
      "email"
    );
  }

  if (!response.ok) {
    throw new AuthRequestError(
      readApiMessage(data, "Unable to create your account. Please try again."),
      response.status
    );
  }

  return (data ?? {}) as AuthRegisterResponse;
}
