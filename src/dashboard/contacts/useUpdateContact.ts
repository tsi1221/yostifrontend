import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type {
  ContactFieldErrors,
  ContactFormValues,
  ContactRecord,
} from "./types";
import {
  CONTACT_NOT_FOUND_MESSAGE,
  ContactRequestError,
  formValuesToPayload,
  patchContact,
  validateContactForm,
} from "./api";

export function useUpdateContact(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  const updateContact = async (
    values: ContactFormValues,
  ): Promise<ContactRecord | null> => {
    const clientErrors = validateContactForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setNotFound(null);
    setFieldErrors({});

    try {
      const updated = await patchContact(id, formValuesToPayload(values));
      message.success("Contact updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof ContactRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ContactRequestError && cause.status === 401) {
        expireSession(navigate);
        return null;
      }

      if (cause instanceof ContactRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return null;
      }

      if (cause instanceof ContactRequestError && cause.status === 404) {
        setNotFound(CONTACT_NOT_FOUND_MESSAGE);
        message.warning(CONTACT_NOT_FOUND_MESSAGE);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update contact.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateContact, saving, notFound, fieldErrors };
}
