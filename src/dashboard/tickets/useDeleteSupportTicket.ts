import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import type { TicketDeletionPhase } from "./types";
import {
  TicketsRequestError,
  deleteSupportTicket,
  invalidateSupportsCache,
  invalidateTicketsCache,
} from "./ticketsService";

export function useDeleteSupportTicket() {
  const navigate = useNavigate();
  useDashboard();
  const [phase, setPhase] = useState<TicketDeletionPhase>("idle");
  const listPath = dashboardPath("supports");

  const removeTicket = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteSupportTicket(id);
      message.success(successMessage);
      invalidateTicketsCache();
      invalidateSupportsCache();
      setPhase("idle");
      navigate(listPath, { replace: true });
      return true;
    } catch (cause) {
      if (cause instanceof TicketsRequestError && cause.status === 400) {
        message.error(cause.message);
        setPhase("confirming");
        return false;
      }

      if (cause instanceof TicketsRequestError && cause.status === 401) {
        expireSession(navigate);
        return false;
      }

      if (cause instanceof TicketsRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return false;
      }

      if (cause instanceof TicketsRequestError && cause.status === 404) {
        message.warning(
          "This support ticket could not be found or has been removed.",
        );
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete support ticket.",
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeTicket,
    phase,
    deleting: phase === "deleting",
    beginConfirm: () => setPhase("confirming"),
    reset: () => setPhase("idle"),
  };
}
