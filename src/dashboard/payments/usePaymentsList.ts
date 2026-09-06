import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { isQuietListFailure } from "../apiMessage";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { PaymentsListQuery, PaymentsListResponse } from "./types";
import { DEFAULT_PAYMENTS_QUERY } from "./types";
import {
  PAYMENTS_INVALIDATE_EVENT,
  PaymentsRequestError,
  fetchPaymentsList,
  isPreviewAccessToken,
} from "./paymentsService";

const EMPTY_RESPONSE: PaymentsListResponse = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function usePaymentsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PaymentsListQuery>(DEFAULT_PAYMENTS_QUERY);
  const [response, setResponse] = useState<PaymentsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);

  const query = useMemo<PaymentsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      service: filters.service,
      method: filters.method,
      status: filters.status,
    }),
    [filters.method, filters.page, filters.pageSize, filters.service, filters.status, search]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchPaymentsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof PaymentsRequestError && cause.status === 401) {
        setResponse(null);

        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load payments.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (isQuietListFailure(cause)) {
        setResponse(EMPTY_RESPONSE);
        return;
      }

      setResponse(EMPTY_RESPONSE);
    } finally {
      setLoading(false);
    }
  }, [navigate, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(PAYMENTS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(PAYMENTS_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof PaymentsListQuery>(
    key: K,
    value: PaymentsListQuery[K]
  ) => {
    setFilters((current) => ({
      ...current,
      page: key === "page" ? Number(value) : 1,
      [key]: value,
    }));
  };

  const setPage = (page: number) => {
    setFilters((current) => ({ ...current, page }));
  };

  const setPageSize = (pageSize: number) => {
    setFilters((current) => ({ ...current, page: 1, pageSize }));
  };

  return {
    filters,
    setFilter,
    setPage,
    setPageSize,
    payments: response?.data ?? [],
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
