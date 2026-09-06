import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { RoleFieldErrors, RoleFormValues, RoleRecord } from "./types";
import {
  ROLE_NAME_TAKEN_MESSAGE,
  RoleRequestError,
  createRole,
  formValuesToPayload,
  isPreviewAccessToken,
  validateRoleForm,
} from "./api";

export function useCreateRole() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RoleFieldErrors>({});

  const submitRole = async (values: RoleFormValues): Promise<RoleRecord | null> => {
    const clientErrors = validateRoleForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setAuthError(null);
    setFieldErrors({});

    try {
      const created = await createRole(formValuesToPayload(values));
      message.success(created.message);
      return created.record;
    } catch (cause) {
      if (cause instanceof RoleRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof RoleRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          const previewMessage = "Sign in with a live account to create a role.";
          setAuthError(previewMessage);
          message.error(previewMessage);
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof RoleRequestError && cause.status === 409) {
        setConflict(cause.message);
        setFieldErrors({ name: cause.fields?.name || ROLE_NAME_TAKEN_MESSAGE });
        return null;
      }

      message.error(
        cause instanceof Error ? cause.message : "Server error occurred. Could not create this role."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitRole, saving, conflict, authError, fieldErrors };
}
