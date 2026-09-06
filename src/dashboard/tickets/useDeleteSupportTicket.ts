import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { TicketDeletionPhase } from "./types";
import {
  TicketsRequestError,
  deleteSupportTicket,
  invalidateSupportsCache,
  invalidateTicketsCache,
  isPreviewAccessToken,
} from "./ticketsService";

export function useDeleteSupportTicket() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [phase, setPhase] = useState<TicketDeletionPhase>("idle");
  const listPath = `/${ROLE_SLUG[role]}/supports`;

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
        if (isPreviewAccessToken(getAccessToken())) {
          message.error(
            "Sign in with a live account to delete this support ticket."
          );
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof TicketsRequestError && cause.status === 404) {
        message.warning(
          "This support ticket could not be found or has been removed."
        );
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete support ticket."
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
