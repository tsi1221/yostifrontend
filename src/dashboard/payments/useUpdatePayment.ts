import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { PaymentFieldErrors, UpdatePaymentFormValues } from "./types";
import {
  PaymentsRequestError,
  isPreviewAccessToken,
  patchPayment,
  updateFormValuesToPayload,
  validateUpdatePaymentForm,
} from "./paymentsService";

export function useUpdatePayment(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PaymentFieldErrors>({});

  const updatePayment = async (values: UpdatePaymentFormValues) => {
    const clientErrors = validateUpdatePaymentForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const updated = await patchPayment(id, updateFormValuesToPayload(values));
      message.success("Payment updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof PaymentsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to update this payment.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 404) {
        message.warning("This payment could not be found or has been removed.");
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update payment."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updatePayment, saving, fieldErrors };
}
