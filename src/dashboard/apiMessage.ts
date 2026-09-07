export function isPermissionDeniedMessage(message: string) {
  return /required permissions|access denied|you are not authorized|forbidden|perform this action/i.test(
    message
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
    /^not found$/i.test(value)
  );
}

export function sanitizeApiMessage(message: string | undefined, fallback: string) {
  if (!message || isTechnicalApiMessage(message) || isPermissionDeniedMessage(message)) {
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
  return (
    status === 404 ||
    status === 405 ||
    isTechnicalApiMessage(message)
  );
}

export function liveListFailureMessage(cause: unknown, resource: string) {
  const message = cause instanceof Error ? cause.message.trim() : "";
  if (message && !isTechnicalApiMessage(message) && !isPermissionDeniedMessage(message)) {
    return message;
  }
  return `Unable to load ${resource}. Check your connection and try again.`;
}
