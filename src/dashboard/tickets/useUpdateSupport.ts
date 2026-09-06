import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TicketFieldErrors, UpdateSupportFormValues } from "./types";
import {
  TicketsRequestError,
  isPreviewAccessToken,
  patchSupport,
  updateFormValuesToPayload,
  validateUpdateTicketForm,
} from "./ticketsService";

export function useUpdateSupport(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TicketFieldErrors>({});

  const updateSupport = async (values: UpdateSupportFormValues) => {
    const clientErrors = validateUpdateTicketForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const updated = await patchSupport(id, updateFormValuesToPayload(values));
      message.success("Ticket updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof TicketsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof TicketsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to update this support ticket.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof TicketsRequestError && cause.status === 404) {
        message.warning(
          "This support ticket could not be found or has been removed."
        );
        return null;
      }

      if (cause instanceof TicketsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update support ticket."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateSupport, saving, conflict, fieldErrors };
}
