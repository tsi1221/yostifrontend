import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { RoleFieldErrors, RoleFormValues, RoleRecord } from "./types";
import {
  ROLE_NAME_TAKEN_MESSAGE,
  ROLE_NOT_FOUND_MESSAGE,
  UPDATE_ROLE_SUCCESS_MESSAGE,
  RoleRequestError,
  formValuesToPayload,
  isPreviewAccessToken,
  patchRole,
  validateRoleForm,
} from "./api";

export function useUpdateRole(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RoleFieldErrors>({});

  const updateRole = async (values: RoleFormValues): Promise<RoleRecord | null> => {
    const clientErrors = validateRoleForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setNotFound(null);
    setAuthError(null);
    setFieldErrors({});

    try {
      const updated = await patchRole(id, formValuesToPayload(values));
      message.success(UPDATE_ROLE_SUCCESS_MESSAGE);
      return updated;
    } catch (cause) {
      if (cause instanceof RoleRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof RoleRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          const previewMessage = "Sign in with a live account to update this role.";
          setAuthError(previewMessage);
          message.error(previewMessage);
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof RoleRequestError && cause.status === 404) {
        setNotFound(ROLE_NOT_FOUND_MESSAGE);
        message.warning(ROLE_NOT_FOUND_MESSAGE);
        return null;
      }

      if (cause instanceof RoleRequestError && cause.status === 409) {
        setFieldErrors({ name: cause.fields?.name || ROLE_NAME_TAKEN_MESSAGE });
        return null;
      }

      message.error(
        cause instanceof Error ? cause.message : "Server error occurred. Could not update this role."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateRole, saving, notFound, authError, fieldErrors };
}
