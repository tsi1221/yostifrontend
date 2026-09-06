import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { isQuietListFailure } from "../apiMessage";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { InspectionsListQuery, InspectionsListResponse } from "./types";
import { DEFAULT_INSPECTIONS_QUERY } from "./types";
import {
  INSPECTIONS_INVALIDATE_EVENT,
  InspectionsRequestError,
  fetchInspectionsList,
  isPreviewAccessToken,
} from "./inspectionsService";

const EMPTY_RESPONSE: InspectionsListResponse = {
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

export function useInspectionsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<InspectionsListQuery>(DEFAULT_INSPECTIONS_QUERY);
  const [response, setResponse] = useState<InspectionsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 500);
  const productType = useDebouncedValue(filters.productType, 500);

  const query = useMemo<InspectionsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      type: filters.type,
      productType,
      photoVideoRequired: filters.photoVideoRequired,
      date: filters.date,
    }),
    [
      filters.date,
      filters.page,
      filters.pageSize,
      filters.photoVideoRequired,
      filters.type,
      productType,
      search,
    ]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchInspectionsList(query);
      setResponse(payload);
    } catch (cause) {
      setResponse(null);

      if (cause instanceof InspectionsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load inspections.");
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

      if (cause instanceof InspectionsRequestError && cause.status === 400) {
        message.error(cause.message);
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
    window.addEventListener(INSPECTIONS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(INSPECTIONS_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof InspectionsListQuery>(
    key: K,
    value: InspectionsListQuery[K]
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
    inspections: response?.data ?? [],
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
