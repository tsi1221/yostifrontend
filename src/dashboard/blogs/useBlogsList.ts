import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { liveListFailureMessage } from "../apiMessage";
import { LIVE_DATA_RELOAD_EVENT } from "../auth/liveDataReload";
import type { BlogsListQuery, BlogsListResponse } from "./types";
import { DEFAULT_BLOGS_QUERY } from "./types";
import {
  BLOGS_INVALIDATE_EVENT,
  BlogRequestError,
  fetchBlogsList,
} from "./api";

const EMPTY_RESPONSE: BlogsListResponse = {
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

export function useBlogsList(options?: { publicFeed?: boolean }) {
  const navigate = useNavigate();
  const publicFeed = options?.publicFeed === true;
  const [filters, setFilters] = useState<BlogsListQuery>(DEFAULT_BLOGS_QUERY);
  const [response, setResponse] = useState<BlogsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const title = useDebouncedValue(filters.title, 400);

  const query = useMemo<BlogsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      title,
    }),
    [filters.page, filters.pageSize, search, title],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchBlogsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof BlogRequestError && cause.status === 401) {
        if (publicFeed) {
          setServerError(
            "Unable to load this information right now.",
          );
          return;
        }
        expireSession(navigate);
        return;
      }

      if (cause instanceof BlogRequestError && cause.status === 403) {
        setResponse(EMPTY_RESPONSE);
        setServerError(FORBIDDEN_MESSAGE);
        return;
      }

      setResponse(EMPTY_RESPONSE);
      setServerError(liveListFailureMessage(cause, "blog posts"));
    } finally {
      setLoading(false);
    }
  }, [navigate, publicFeed, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(BLOGS_INVALIDATE_EVENT, refresh);
    window.addEventListener(LIVE_DATA_RELOAD_EVENT, refresh);
    return () => {
      window.removeEventListener(BLOGS_INVALIDATE_EVENT, refresh);
      window.removeEventListener(LIVE_DATA_RELOAD_EVENT, refresh);
    };
  }, []);

  const setFilter = <K extends keyof BlogsListQuery>(
    key: K,
    value: BlogsListQuery[K],
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
    blogs: response?.data ?? [],
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
