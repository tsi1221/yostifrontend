import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ContactsListQuery, ContactsListResponse } from "./types";
import { DEFAULT_CONTACTS_QUERY } from "./types";
import {
  CONTACTS_INVALIDATE_EVENT,
  ContactRequestError,
  fetchContactsList,
  isPreviewAccessToken,
} from "./api";

const EMPTY_RESPONSE: ContactsListResponse = {
  data: [],
  meta: { total: 0, page: 1, pageSize: 10, totalPages: 1 },
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useContactsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ContactsListQuery>(DEFAULT_CONTACTS_QUERY);
  const [response, setResponse] = useState<ContactsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const fullname = useDebouncedValue(filters.fullname, 400);
  const email = useDebouncedValue(filters.email, 400);
  const topic = useDebouncedValue(filters.topic, 400);

  const query = useMemo<ContactsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      fullname,
      email,
      topic,
    }),
    [email, filters.page, filters.pageSize, fullname, search, topic]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchContactsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof ContactRequestError && cause.status === 401) {
        setResponse(null);
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load contact submissions.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      setServerError(
        cause instanceof Error
          ? cause.message
          : "The server could not load contact submissions."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(CONTACTS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(CONTACTS_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof ContactsListQuery>(
    key: K,
    value: ContactsListQuery[K]
  ) => {
    setFilters((current) => ({
      ...current,
      page: key === "page" ? Number(value) : 1,
      [key]: value,
    }));
  };

  return {
    filters,
    setFilter,
    setPage: (page: number) => setFilters((current) => ({ ...current, page })),
    setPageSize: (pageSize: number) =>
      setFilters((current) => ({ ...current, page: 1, pageSize })),
    contacts: response?.data ?? [],
    meta: response?.meta ?? {
      ...EMPTY_RESPONSE.meta,
      page: filters.page,
      pageSize: filters.pageSize,
    },
    loading,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
