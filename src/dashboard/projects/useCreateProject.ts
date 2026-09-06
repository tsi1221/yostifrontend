import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ProjectFieldErrors, ProjectFormValues, ProjectRecord } from "./types";
import {
  PROJECT_TITLE_IN_USE_MESSAGE,
  ProjectRequestError,
  createProject,
  formValuesToPayload,
  isPreviewAccessToken,
  validateProjectForm,
} from "./api";

export function useCreateProject() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({});

  const submitProject = async (
    values: ProjectFormValues
  ): Promise<ProjectRecord | null> => {
    const clientErrors = validateProjectForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setAuthError(null);
    setFieldErrors({});

    try {
      const created = await createProject(formValuesToPayload(values));
      message.success(created.message);
      return created.record;
    } catch (cause) {
      if (cause instanceof ProjectRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof ProjectRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          const previewMessage = "Sign in with a live account to create a project.";
          setAuthError(previewMessage);
          message.error(previewMessage);
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof ProjectRequestError && cause.status === 409) {
        setConflict(cause.message);
        setFieldErrors({ title: cause.fields?.title || PROJECT_TITLE_IN_USE_MESSAGE });
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create project."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitProject, saving, conflict, authError, fieldErrors };
}
