import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { ProjectDeletionPhase } from "./types";
import {
  PROJECT_NOT_FOUND_MESSAGE,
  ProjectRequestError,
  deleteProject,
  invalidateProjectsCache,
  isPreviewAccessToken,
} from "./api";

export function useDeleteProject() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [phase, setPhase] = useState<ProjectDeletionPhase>("idle");
  const listPath = `/${ROLE_SLUG[role]}/projects`;

  const removeProject = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteProject(id);
      message.success(successMessage);
      invalidateProjectsCache();
      setPhase("idle");
      navigate(listPath, { replace: true });
      return true;
    } catch (cause) {
      if (cause instanceof ProjectRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to delete this project.");
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof ProjectRequestError && cause.status === 404) {
        message.warning(PROJECT_NOT_FOUND_MESSAGE);
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete project."
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeProject,
    phase,
    deleting: phase === "deleting",
  };
}
