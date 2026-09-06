import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ServiceFieldErrors, ServiceFormValues, ServiceRecord } from "./types";
import {
  ServiceRequestError,
  createService,
  formValuesToPayload,
  isPreviewAccessToken,
  validateServiceForm,
} from "./servicesService";

export function useCreateService() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ServiceFieldErrors>({});

  const submitService = async (
    values: ServiceFormValues
  ): Promise<ServiceRecord | null> => {
    const clientErrors = validateServiceForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setAuthError(null);
    setFieldErrors({});

    try {
      const created = await createService(formValuesToPayload(values));
      message.success(created.message);
      return created.record;
    } catch (cause) {
      if (cause instanceof ServiceRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ServiceRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          const previewMessage =
            "Sign in with a live account to create a service.";
          setAuthError(previewMessage);
          message.error(previewMessage);
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof ServiceRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create service."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitService, saving, conflict, authError, fieldErrors };
}
