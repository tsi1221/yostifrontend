import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { liveListFailureMessage } from "../apiMessage";
import { LIVE_DATA_RELOAD_EVENT } from "../auth/liveDataReload";
import type { ContactsListQuery, ContactsListResponse } from "./types";
import { DEFAULT_CONTACTS_QUERY } from "./types";
import {
  CONTACTS_INVALIDATE_EVENT,
  ContactRequestError,
  fetchContactsList,
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

export function useContactsList(options?: { enabled?: boolean; authReady?: boolean }) {
  const navigate = useNavigate();
  const enabled = options?.enabled !== false && options?.authReady !== false;
  const [filters, setFilters] = useState<ContactsListQuery>(
    DEFAULT_CONTACTS_QUERY,
  );
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
    [email, filters.page, filters.pageSize, fullname, search, topic],
  );

  const load = useCallback(async () => {
    if (!enabled) {
      setResponse(null);
      setLoading(false);
      setServerError(null);
      return;
    }
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchContactsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof ContactRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }

      if (cause instanceof ContactRequestError && cause.status === 403) {
        setResponse(EMPTY_RESPONSE);
        setServerError(FORBIDDEN_MESSAGE);
        return;
      }

      setResponse(EMPTY_RESPONSE);
      setServerError(liveListFailureMessage(cause, "contact submissions"));
    } finally {
      setLoading(false);
    }
  }, [enabled, navigate, query]);

  useEffect(() => {
    void load();
  }, [enabled, load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(CONTACTS_INVALIDATE_EVENT, refresh);
    window.addEventListener(LIVE_DATA_RELOAD_EVENT, refresh);
    return () => {
      window.removeEventListener(CONTACTS_INVALIDATE_EVENT, refresh);
      window.removeEventListener(LIVE_DATA_RELOAD_EVENT, refresh);
    };
  }, []);

  const setFilter = <K extends keyof ContactsListQuery>(
    key: K,
    value: ContactsListQuery[K],
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
