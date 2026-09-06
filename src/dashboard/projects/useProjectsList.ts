import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { isQuietListFailure } from "../apiMessage";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ProjectsListQuery, ProjectsListResponse } from "./types";
import { DEFAULT_PROJECTS_QUERY } from "./types";
import {
  PROJECTS_INVALIDATE_EVENT,
  ProjectRequestError,
  fetchProjectsList,
  isPreviewAccessToken,
} from "./api";

const EMPTY_RESPONSE: ProjectsListResponse = {
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

export function useProjectsList(options?: { publicFeed?: boolean }) {
  const navigate = useNavigate();
  const publicFeed = options?.publicFeed === true;
  const [filters, setFilters] = useState<ProjectsListQuery>(DEFAULT_PROJECTS_QUERY);
  const [response, setResponse] = useState<ProjectsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const search = useDebouncedValue(filters.search, 400);
  const title = useDebouncedValue(filters.title, 400);

  const query = useMemo<ProjectsListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search,
      title,
    }),
    [filters.page, filters.pageSize, search, title]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);

    try {
      const payload = await fetchProjectsList(query);
      setResponse(payload);
    } catch (cause) {
      if (cause instanceof ProjectRequestError && cause.status === 401) {
        setResponse(null);
        if (publicFeed || isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load projects.");
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
  }, [navigate, publicFeed, query]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(PROJECTS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(PROJECTS_INVALIDATE_EVENT, refresh);
  }, []);

  const setFilter = <K extends keyof ProjectsListQuery>(
    key: K,
    value: ProjectsListQuery[K]
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
    projects: response?.data ?? [],
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
