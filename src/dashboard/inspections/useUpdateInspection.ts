import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { InspectionFieldErrors, UpdateInspectionFormValues } from "./types";
import {
  InspectionsRequestError,
  isPreviewAccessToken,
  patchInspection,
  updateFormValuesToPayload,
  validateUpdateInspectionForm,
} from "./inspectionsService";

export function useUpdateInspection(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<InspectionFieldErrors>({});

  const updateInspection = async (values: UpdateInspectionFormValues) => {
    const clientErrors = validateUpdateInspectionForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const updated = await patchInspection(id, updateFormValuesToPayload(values));
      message.success("Inspection updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof InspectionsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to update this inspection.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 404) {
        message.warning(
          "This inspection could not be found or has been removed."
        );
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update inspection."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateInspection, saving, fieldErrors };
}
