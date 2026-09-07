import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { InspectionFieldErrors, InspectionFormValues } from "./types";
import {
  InspectionsRequestError,
  createInspection,
  formValuesToPayload,
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
        expireSession(navigate);
        return null;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create inspection.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitInspection, saving, fieldErrors };
}
