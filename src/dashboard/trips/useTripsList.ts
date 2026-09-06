import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { isQuietListFailure } from "../apiMessage";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TripsListQuery, TripsListResponse } from "./types";
import { DEFAULT_TRIPS_QUERY } from "./types";
import {
  TRIPS_INVALIDATE_EVENT,
  TripsRequestError,
  fetchTripsList,
  isPreviewAccessToken,
} from "./tripsService";

const EMPTY_RESPONSE: TripsListResponse = {
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

export function useTripsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TripsListQuery>(DEFAULT_TRIPS_QUERY);
  const [response, setResponse] = useState<TripsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const arrivalCity = useDebouncedValue(filters.arrivalCity, 400);

  const query = useMemo<TripsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      arrivalCity,
      status: filters.status,
    }),
    [arrivalCity, filters.page, filters.pageSize, filters.status, search]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchTripsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof TripsRequestError && cause.status === 401) {
        setResponse(null);

        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load trips.");
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
    window.addEventListener(TRIPS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(TRIPS_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof TripsListQuery>(
    key: K,
    value: TripsListQuery[K]
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
    trips: response?.data ?? [],
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
