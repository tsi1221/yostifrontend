import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { InspectionDeletionPhase } from "./types";
import {
  InspectionsRequestError,
  deleteInspection,
  isPreviewAccessToken,
} from "./inspectionsService";

export function useDeleteInspection() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<InspectionDeletionPhase>("idle");

  const removeInspection = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteInspection(id);
      message.success(successMessage);
      setPhase("idle");
      return true;
    } catch (cause) {
      if (cause instanceof InspectionsRequestError && cause.status === 400) {
        message.error(cause.message);
        setPhase("confirming");
        return false;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error(
            "Sign in with a live account to delete this inspection request."
          );
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof InspectionsRequestError && cause.status === 404) {
        message.warning(
          "This inspection request does not exist or has already been removed."
        );
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete inspection."
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeInspection,
    phase,
    deleting: phase === "deleting",
    beginConfirm: () => setPhase("confirming"),
    reset: () => setPhase("idle"),
  };
}
