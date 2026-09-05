import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { SourcingRequestRecord } from "./types";
import {
  RequestsRequestError,
  fetchRequestById,
  isPreviewAccessToken,
} from "./requestsService";

export function useRequestDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [request, setRequest] = useState<SourcingRequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchRequestById(id);
      setRequest(payload);
    } catch (cause) {
      setRequest(null);

      if (cause instanceof RequestsRequestError && cause.status === 400) {
        message.error(cause.message);
        setServerError(cause.message);
        return;
      }

      if (cause instanceof RequestsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live Super Admin account to load this request.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof RequestsRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      setServerError(
        cause instanceof Error
          ? cause.message
          : "The server could not load this request."
      );
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  return {
    request,
    loading,
    notFound,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
