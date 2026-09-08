import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { SourcingRequestRecord } from "./types";
import { RequestsRequestError, fetchRequestById } from "./requestsService";

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
        expireSession(navigate);
        return;
      }

      if (cause instanceof RequestsRequestError && cause.status === 403) {
        setServerError(FORBIDDEN_MESSAGE);
        return;
      }

      if (cause instanceof RequestsRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      setServerError(
        cause instanceof Error
          ? cause.message
          : "We couldn't load this request.",
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
    applyRequest: setRequest,
    retry: () => setReloadToken((value) => value + 1),
  };
}
