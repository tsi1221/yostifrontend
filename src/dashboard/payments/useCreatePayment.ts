import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { PaymentFieldErrors, PaymentFormValues } from "./types";
import {
  PaymentsRequestError,
  createPayment,
  formValuesToPayload,
  isPreviewAccessToken,
  validatePaymentForm,
} from "./paymentsService";

export function useCreatePayment() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PaymentFieldErrors>({});

  const submitPayment = async (values: PaymentFormValues) => {
    const clientErrors = validatePaymentForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const created = await createPayment(formValuesToPayload(values));
      message.success("Payment initiated successfully.");
      return created;
    } catch (cause) {
      if (cause instanceof PaymentsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to initiate a payment.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not initiate payment."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitPayment, saving, conflict, fieldErrors };
}
