import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import type { ServiceDeletionPhase } from "./types";
import {
  SERVICE_NOT_FOUND_MESSAGE,
  ServiceRequestError,
  deleteService,
  invalidateServicesCache,
} from "./servicesService";

export function useDeleteService() {
  const navigate = useNavigate();
  useDashboard();
  const [phase, setPhase] = useState<ServiceDeletionPhase>("idle");
  const listPath = dashboardPath("services");

  const removeService = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteService(id);
      message.success(successMessage);
      invalidateServicesCache();
      setPhase("idle");
      navigate(listPath, { replace: true });
      return true;
    } catch (cause) {
      if (cause instanceof ServiceRequestError && cause.status === 400) {
        message.error(cause.message);
        setPhase("confirming");
        return false;
      }

      if (cause instanceof ServiceRequestError && cause.status === 401) {
        expireSession(navigate);
        return false;
      }

      if (cause instanceof ServiceRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return false;
      }

      if (cause instanceof ServiceRequestError && cause.status === 404) {
        message.warning(SERVICE_NOT_FOUND_MESSAGE);
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete service.",
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeService,
    phase,
    deleting: phase === "deleting",
    beginConfirm: () => setPhase("confirming"),
    reset: () => setPhase("idle"),
  };
}
