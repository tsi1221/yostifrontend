import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { ShipmentFieldErrors, UpdateShipmentFormValues } from "./types";
import {
  ShipmentsRequestError,
  patchShipment,
  updateFormValuesToPayload,
  validateUpdateShipmentForm,
} from "./shipmentsService";

export function useUpdateShipment(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ShipmentFieldErrors>({});

  const updateShipment = async (values: UpdateShipmentFormValues) => {
    const clientErrors = validateUpdateShipmentForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const updated = await patchShipment(
        id,
        updateFormValuesToPayload(values),
      );
      message.success("Shipment updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof ShipmentsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 401) {
        expireSession(navigate);
        return null;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return null;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 404) {
        message.warning(
          "This shipment could not be found or has been removed.",
        );
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update shipment.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateShipment, saving, fieldErrors };
}
