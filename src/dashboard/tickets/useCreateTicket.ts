import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { TicketFieldErrors, TicketFormValues } from "./types";
import {
  TicketsRequestError,
  createTicket,
  formValuesToPayload,
  validateTicketForm,
} from "./ticketsService";

export function useCreateTicket() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TicketFieldErrors>({});

  const submitTicket = async (values: TicketFormValues) => {
    const clientErrors = validateTicketForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const created = await createTicket(formValuesToPayload(values));
      message.success("Support ticket created successfully.");
      return created;
    } catch (cause) {
      if (cause instanceof TicketsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof TicketsRequestError && cause.status === 401) {
        expireSession(navigate);
        return null;
      }

      if (cause instanceof TicketsRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return null;
      }

      if (cause instanceof TicketsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create support ticket.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitTicket, saving, conflict, fieldErrors };
}
