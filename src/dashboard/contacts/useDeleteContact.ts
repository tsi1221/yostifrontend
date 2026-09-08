import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { ContactDeletionPhase } from "./types";
import {
  CONTACT_NOT_FOUND_MESSAGE,
  ContactRequestError,
  deleteContact,
  invalidateContactsCache,
} from "./api";

export function useDeleteContact() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [phase, setPhase] = useState<ContactDeletionPhase>("idle");
  const listPath = `/${ROLE_SLUG[role]}/contacts`;

  const removeContact = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteContact(id);
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
