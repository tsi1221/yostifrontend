import api, { getApiStatus, readApiError } from "../../lib/api";
import type {
  AuthRegisterRequest,
  AuthRegisterResponse,
  RegisterRole,
} from "../types/auth";

export const REGISTER_ROLE_OPTIONS: {
  label: string;
  role: RegisterRole;
  roleId: number;
}[] = [
  { label: "Buyer", role: "Buyer", roleId: 3 },
  { label: "Supplier", role: "Supplier", roleId: 4 },
  { label: "Logistics Partner", role: "Logistic", roleId: 5 },
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
    REGISTER_ROLE_OPTIONS.find((option) => option.role === role)?.roleId ?? 3
  );
}

export async function registerAccount(
  payload: AuthRegisterRequest,
): Promise<AuthRegisterResponse> {
  try {
    const response = await api.post("/auth/register", payload, {
      validateStatus: () => true,
    });
    const data: unknown = response.data;

    if (response.status === 409) {
      throw new AuthRequestError(
        "This email address is already registered.",
        409,
        "email",
      );
    }

    if (response.status < 200 || response.status >= 300) {
      throw new AuthRequestError(
        readApiMessage(data, "Unable to create your account. Please try again."),
        response.status,
      );
    }

    return (data ?? {}) as AuthRegisterResponse;
  } catch (error) {
    if (error instanceof AuthRequestError) {
      throw error;
    }
    throw new AuthRequestError(
      readApiError(
        error,
        "Unable to connect to the server. Check your connection and try again.",
      ),
      getApiStatus(error),
    );
  }
}
