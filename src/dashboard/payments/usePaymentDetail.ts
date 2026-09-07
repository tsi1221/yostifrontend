import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { PaymentRecord } from "./types";
import {
  PaymentsRequestError,
  fetchPayment,
  parsePaymentId,
} from "./paymentsService";

export function usePaymentDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const paymentId = parsePaymentId(id);
    if (paymentId === undefined) {
      setPayment(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchPayment(paymentId);
      setPayment(payload);
    } catch (cause) {
      setPayment(null);

      if (cause instanceof PaymentsRequestError && cause.status === 400) {
        message.error(cause.message);
        setServerError(cause.message);
        return;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 403) {
        setServerError(FORBIDDEN_MESSAGE);
        return;
      }

      if (cause instanceof PaymentsRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error
          ? cause.message
          : "We couldn't load this transaction record.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  return {
    payment,
    loading,
    notFound,
    serverError,
    applyPayment: setPayment,
    retry: () => setReloadToken((value) => value + 1),
  };
}
