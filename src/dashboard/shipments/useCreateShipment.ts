import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ShipmentFieldErrors, ShipmentFormValues } from "./types";
import {
  ShipmentsRequestError,
  createShipment,
  formValuesToPayload,
  isPreviewAccessToken,
  validateShipmentForm,
} from "./shipmentsService";

export function useCreateShipment() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ShipmentFieldErrors>({});

  const submitShipment = async (values: ShipmentFormValues) => {
    const clientErrors = validateShipmentForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const created = await createShipment(formValuesToPayload(values));
      message.success("Shipment created successfully.");
      return created;
    } catch (cause) {
      if (cause instanceof ShipmentsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to create a shipment.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create shipment."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitShipment, saving, conflict, fieldErrors };
}
