import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "yosti_seen_contact_notifications";

type ContactId = number;

function readSeenIds(storageKey: string): Set<ContactId> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    );
  } catch {
    return new Set();
  }
}

function persistSeenIds(storageKey: string, ids: Set<ContactId>) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify([...ids]));
}

export function useSeenContactNotifications(userId: string) {
  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}_${userId || "anonymous"}`,
    [userId],
  );
  const [seenIds, setSeenIds] = useState<Set<ContactId>>(() =>
    readSeenIds(storageKey),
  );

  useEffect(() => {
    setSeenIds(readSeenIds(storageKey));
  }, [storageKey]);

  const markSeen = useCallback(
    (contactId: number) => {
      const normalizedId = Number(contactId);
      if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
        return;
      }

      setSeenIds((current) => {
        if (current.has(normalizedId)) {
          return current;
        }
        const next = new Set(current);
        next.add(normalizedId);
        persistSeenIds(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const removeSeen = useCallback(
    (contactId: number) => {
      const normalizedId = Number(contactId);
      if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
        return;
      }

      setSeenIds((current) => {
        if (!current.has(normalizedId)) {
          return current;
        }
        const next = new Set(current);
        next.delete(normalizedId);
        persistSeenIds(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return { seenIds, markSeen, removeSeen };
}
