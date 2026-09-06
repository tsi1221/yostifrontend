import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TripDeletionPhase } from "./types";
import {
  TripsRequestError,
  deleteTrip,
  isPreviewAccessToken,
} from "./tripsService";

export function useDeleteTrip() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<TripDeletionPhase>("idle");

  const removeTrip = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteTrip(id);
      message.success(successMessage);
      setPhase("idle");
      return true;
    } catch (cause) {
      if (cause instanceof TripsRequestError && cause.status === 400) {
        message.error(cause.message);
        setPhase("confirming");
        return false;
      }

      if (cause instanceof TripsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to delete this trip itinerary.");
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof TripsRequestError && cause.status === 404) {
        message.warning(
          "This trip record does not exist or has already been removed."
        );
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete trip."
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeTrip,
    phase,
    deleting: phase === "deleting",
    beginConfirm: () => setPhase("confirming"),
    reset: () => setPhase("idle"),
  };
}
