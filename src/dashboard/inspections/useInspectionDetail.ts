import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { isTechnicalApiMessage, sanitizeApiMessage } from "../apiMessage";
import { clearAuthSession, getAccessToken } from "../auth/session";
import type { InspectionRecord } from "./types";
import {
  InspectionsRequestError,
  fetchInspection,
  isPreviewAccessToken,
  parseInspectionId,
} from "./inspectionsService";

export function useInspectionDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<InspectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const inspectionId = parseInspectionId(id);
    if (inspectionId === undefined) {
      setInspection(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchInspection(inspectionId);
      setInspection(payload);
    } catch (cause) {
      setInspection(null);

      if (cause instanceof InspectionsRequestError && cause.status === 400) {
        const text = sanitizeApiMessage(cause.message, "Unable to load this inspection.");
        message.error(text);
        setServerError(text);
        return;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError(
            "Sign in with a live account to load this inspection request."
          );
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (
        (cause instanceof InspectionsRequestError && cause.status === 404) ||
        (cause instanceof Error && isTechnicalApiMessage(cause.message))
      ) {
        setNotFound(true);
        return;
      }

      setServerError("Unable to load this inspection.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  return {
    inspection,
    loading,
    notFound,
    serverError,
    applyInspection: setInspection,
    retry: () => setReloadToken((value) => value + 1),
  };
}
