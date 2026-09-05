import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { PaymentDeletionPhase } from "./types";
import {
  PaymentsRequestError,
  deletePayment,
  isPreviewAccessToken,
} from "./paymentsService";

export function useDeletePayment() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<PaymentDeletionPhase>("idle");

  const removePayment = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deletePayment(id);
      message.success(successMessage);
      setPhase("idle");
      return true;
    } catch (cause) {
      if (cause instanceof PaymentsRequestError && cause.status === 400) {
        message.error(cause.message);
        setPhase("confirming");
        return false;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error(
            "Sign in with a live account to delete this payment record."
          );
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 404) {
        message.warning(
          "This payment record does not exist or has already been removed."
        );
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete payment."
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removePayment,
    phase,
    deleting: phase === "deleting",
    beginConfirm: () => setPhase("confirming"),
    reset: () => setPhase("idle"),
  };
}
