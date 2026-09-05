import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { RequestFieldErrors, RequestUpdatePayload } from "./types";
import {
  RequestsRequestError,
  isPreviewAccessToken,
  patchRequest,
} from "./requestsService";

export function useUpdateRequest(id: string) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RequestFieldErrors>({});

  const updateRequest = async (payload: RequestUpdatePayload) => {
    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const updated = await patchRequest(id, payload);
      message.success("Request updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof RequestsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof RequestsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live Super Admin account to save this request.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof RequestsRequestError && cause.status === 404) {
        message.error(cause.message);
        return null;
      }

      if (cause instanceof RequestsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error ? cause.message : "Unable to save this request."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateRequest, saving, conflict, fieldErrors };
}
