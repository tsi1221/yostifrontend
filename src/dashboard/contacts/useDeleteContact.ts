import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import { useSeenContactNotifications } from "./useSeenContactNotifications";
import type { ContactDeletionPhase } from "./types";
import {
  CONTACT_NOT_FOUND_MESSAGE,
  ContactRequestError,
  deleteContact,
  invalidateContactsCache,
} from "./api";

export function useDeleteContact() {
  const navigate = useNavigate();
  const { user } = useDashboard();
  const { removeSeen } = useSeenContactNotifications(user.id);
  const [phase, setPhase] = useState<ContactDeletionPhase>("idle");
  const listPath = dashboardPath("contacts");

  const removeContact = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteContact(id);
      removeSeen(id);
      message.success(successMessage);
      invalidateContactsCache();
      setPhase("idle");
      navigate(listPath, { replace: true });
      return true;
    } catch (cause) {
      if (cause instanceof ContactRequestError && cause.status === 401) {
        expireSession(navigate);
        return false;
      }

      if (cause instanceof ContactRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
        return false;
      }

      if (cause instanceof ContactRequestError && cause.status === 404) {
        message.warning(CONTACT_NOT_FOUND_MESSAGE);
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete contact.",
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeContact,
    phase,
    deleting: phase === "deleting",
  };
}
