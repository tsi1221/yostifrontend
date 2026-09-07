export function isPermissionDeniedMessage(message: string) {
  return /required permissions|access denied|you are not authorized|forbidden|perform this action|permission denied|unauthorized request/i.test(
    message,
  );
}

export function isTechnicalApiMessage(message: string) {
  const value = message.trim();
  if (!value) {
    return true;
  }

  return (
    /cannot\s+(get|post|put|patch|delete)\b/i.test(value) ||
    /\/api\/[^\s]+/i.test(value) ||
    /\b(GET|POST|PUT|PATCH|DELETE)\s+\//i.test(value) ||
    /\b(jwt|endpoint|backend|database|stack trace)\b/i.test(value) ||
    /server returned/i.test(value) ||
    /\b(40[0-9]|500)\s*(forbidden|unauthorized|error)?\b/i.test(value) ||
    /^(not found|unauthorized|forbidden)$/i.test(value) ||
    /\b(read|write|delete|manage|approve|refund):[a-z_]+\b/i.test(value)
  );
}

export function sanitizeApiMessage(
  message: string | undefined,
  fallback: string,
) {
  if (
    !message ||
    isTechnicalApiMessage(message) ||
    isPermissionDeniedMessage(message)
  ) {
    return fallback;
  }
  return message.trim();
}

export function isQuietListFailure(cause: unknown) {
  const status =
    cause && typeof cause === "object" && "status" in cause
      ? Number((cause as { status: unknown }).status)
      : undefined;
  const message = cause instanceof Error ? cause.message : "";
  return status === 404 || status === 405 || isTechnicalApiMessage(message);
}

export function liveListFailureMessage(cause: unknown, _resource?: string) {
  const message = cause instanceof Error ? cause.message.trim() : "";
  if (
    message &&
    !isTechnicalApiMessage(message) &&
    !isPermissionDeniedMessage(message)
  ) {
    return message;
  }
  return "We couldn't load this information. Please try again.";
}

export const LOAD_ERROR_MESSAGE =
  "We couldn't load this information. Please try again.";
export const NETWORK_ERROR_MESSAGE =
  "We couldn't connect. Check your connection and try again.";
export const NO_ACCESS_SECTION_MESSAGE =
  "You don't have access to this section.";
export const NO_ACCESS_INFORMATION_MESSAGE =
  "You don't have access to this information.";
