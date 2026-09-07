import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession } from "../auth/sessionExpiry";

import type { ProjectRecord } from "./types";
import {
  PROJECTS_INVALIDATE_EVENT,
  ProjectRequestError,
  asProjectId,
  fetchProject,
} from "./api";

export function useProjectDetail(
  id: string | undefined,
  options?: { publicFeed?: boolean },
) {
  const navigate = useNavigate();
  const publicFeed = options?.publicFeed === true;
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const projectId = asProjectId(id);
    if (projectId === undefined) {
      setProject(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchProject(projectId);
      setProject(payload);
    } catch (cause) {
      setProject(null);

      if (cause instanceof ProjectRequestError && cause.status === 401) {
        if (publicFeed) {
          setServerError("Sign in to load this content.");
          return;
        }
        expireSession(navigate);
        return;
      }

      if (cause instanceof ProjectRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error
          ? cause.message
          : "We couldn't load this project.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, publicFeed]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(PROJECTS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(PROJECTS_INVALIDATE_EVENT, refresh);
  }, []);

  return {
    project,
    loading,
    notFound,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
