import { useState } from "react";
import { message } from "antd";

import type { ContactFieldErrors, ContactFormValues, ContactRecord } from "./types";
import {
  CONTACT_SUBMITTED_MESSAGE,
  ContactRequestError,
  formValuesToPayload,
  submitContact,
  validateContactForm,
} from "./api";

export function useSubmitContact() {
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState(CONTACT_SUBMITTED_MESSAGE);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  const sendMessage = async (values: ContactFormValues): Promise<ContactRecord | null> => {
    const clientErrors = validateContactForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const created = await submitContact(formValuesToPayload(values));
      setSuccessMessage(created.message || CONTACT_SUBMITTED_MESSAGE);
      setSent(true);
      return created.record;
    } catch (cause) {
      if (cause instanceof ContactRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not send your message."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    sendMessage,
    saving,
    sent,
    successMessage,
    fieldErrors,
    reset: () => {
      setSent(false);
      setFieldErrors({});
    },
  };
}
