import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { InspectionFieldErrors, InspectionFormValues } from "./types";
import {
  InspectionsRequestError,
  createInspection,
  formValuesToPayload,
  isPreviewAccessToken,
  validateInspectionForm,
} from "./inspectionsService";

export function useCreateInspection() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<InspectionFieldErrors>({});

  const submitInspection = async (values: InspectionFormValues) => {
    const clientErrors = validateInspectionForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const created = await createInspection(formValuesToPayload(values));
      message.success("Inspection request created successfully.");
      return created;
    } catch (cause) {
      if (cause instanceof InspectionsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to create an inspection request.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create inspection."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitInspection, saving, fieldErrors };
}
