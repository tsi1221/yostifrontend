import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ProjectFieldErrors, ProjectFormValues, ProjectRecord } from "./types";
import {
  PROJECT_NOT_FOUND_MESSAGE,
  PROJECT_TITLE_IN_USE_MESSAGE,
  ProjectRequestError,
  formValuesToPayload,
  isPreviewAccessToken,
  patchProject,
  validateProjectForm,
} from "./api";

export function useUpdateProject(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({});

  const updateProject = async (
    values: ProjectFormValues
  ): Promise<ProjectRecord | null> => {
    const clientErrors = validateProjectForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setNotFound(null);
    setFieldErrors({});

    try {
      const updated = await patchProject(id, formValuesToPayload(values));
      message.success("Project updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof ProjectRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ProjectRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to update this project.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof ProjectRequestError && cause.status === 404) {
        setNotFound(PROJECT_NOT_FOUND_MESSAGE);
        message.warning(PROJECT_NOT_FOUND_MESSAGE);
        return null;
      }

      if (cause instanceof ProjectRequestError && cause.status === 409) {
        setFieldErrors({ title: cause.fields?.title || PROJECT_TITLE_IN_USE_MESSAGE });
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update project."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateProject, saving, notFound, fieldErrors };
}
