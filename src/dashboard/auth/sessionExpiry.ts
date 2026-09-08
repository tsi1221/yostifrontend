import { message } from "antd";

import { clearAuthSession } from "./session";

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";
export const FORBIDDEN_MESSAGE =
  "You don't have access to this information.";

type NavigateFn = (path: string, options?: { replace?: boolean }) => void;

let redirecting = false;

export function expireSession(navigate?: NavigateFn) {
  if (redirecting) {
    return;
  }
  redirecting = true;
  clearAuthSession();

  try {
    message.warning(SESSION_EXPIRED_MESSAGE);
  } catch {
    // Ant Design may not be mounted yet (for example during a cold interceptor call).
  }

  if (navigate) {
    navigate("/login", { replace: true });
  } else if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.assign("/login");
  }

  window.setTimeout(() => {
    redirecting = false;
  }, 1200);
}

export function isUnauthorizedCause(cause: unknown) {
  return Boolean(
    cause &&
    typeof cause === "object" &&
    "status" in cause &&
    Number((cause as { status: unknown }).status) === 401,
  );
}

export function isForbiddenCause(cause: unknown) {
  return Boolean(
    cause &&
    typeof cause === "object" &&
    "status" in cause &&
    Number((cause as { status: unknown }).status) === 403,
  );
}
