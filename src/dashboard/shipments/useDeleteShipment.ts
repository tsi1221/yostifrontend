import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ShipmentDeletionPhase } from "./types";
import {
  ShipmentsRequestError,
  deleteShipment,
  isPreviewAccessToken,
} from "./shipmentsService";

export function useDeleteShipment() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ShipmentDeletionPhase>("idle");

  const removeShipment = async (id: number) => {
    setPhase("deleting");

    try {
      await deleteShipment(id);
      message.success("Shipment deleted successfully.");
      setPhase("idle");
      return true;
    } catch (cause) {
      if (cause instanceof ShipmentsRequestError && cause.status === 400) {
        message.error(cause.message);
        setPhase("confirming");
        return false;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to delete this shipment.");
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof ShipmentsRequestError && cause.status === 404) {
        message.warning("This shipment does not exist or has already been removed.");
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete shipment."
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeShipment,
    phase,
    deleting: phase === "deleting",
    beginConfirm: () => setPhase("confirming"),
    reset: () => setPhase("idle"),
  };
}
