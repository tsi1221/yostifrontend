import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type {
  ServiceFieldErrors,
  ServiceFormValues,
  ServiceRecord,
} from "./types";
import {
  SERVICE_NOT_FOUND_MESSAGE,
  SERVICE_TITLE_TAKEN_MESSAGE,
  ServiceRequestError,
  formValuesToUpdatePayload,
  patchService,
  validateServiceForm,
} from "./servicesService";

export function useUpdateService(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ServiceFieldErrors>({});

  const updateService = async (
    values: ServiceFormValues,
  ): Promise<ServiceRecord | null> => {
    const clientErrors = validateServiceForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setNotFound(null);
    setFieldErrors({});

    try {
      const updated = await patchService(id, formValuesToUpdatePayload(values));
      message.success("Service updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof ServiceRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ServiceRequestError && cause.status === 401) {
        expireSession(navigate);
        return null;
      }

      if (cause instanceof ServiceRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return null;
      }

      if (cause instanceof ServiceRequestError && cause.status === 404) {
        setNotFound(SERVICE_NOT_FOUND_MESSAGE);
        message.warning(SERVICE_NOT_FOUND_MESSAGE);
        return null;
      }

      if (cause instanceof ServiceRequestError && cause.status === 409) {
        setFieldErrors({
          title: cause.fields?.title || SERVICE_TITLE_TAKEN_MESSAGE,
        });
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update service.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateService, saving, notFound, fieldErrors };
}
