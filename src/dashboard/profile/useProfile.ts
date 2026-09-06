import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import {
  clearAuthSession,
  getStoredAuthUser,
  isPreviewAccessToken,
} from "../auth/session";
import type { AuthUser } from "../types/auth";
import {
  ProfileRequestError,
  profileFormFromUser,
  refreshStoredAuthProfile,
  saveProfileLocally,
  updateCurrentProfile,
  validateProfileForm,
} from "./api";
import type { ProfileFieldErrors, ProfileFormValues } from "./types";

export function useProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [values, setValues] = useState<ProfileFormValues>(() =>
    profileFormFromUser(getStoredAuthUser())
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setRefreshing(true);
      const next = await refreshStoredAuthProfile();
      if (cancelled) {
        return;
      }
      if (next) {
        setUser(next);
        setValues(profileFormFromUser(next));
      }
      setRefreshing(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = useCallback(
    <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => ({ ...current, [key]: undefined }));
    },
    []
  );

  const save = useCallback(async () => {
    const clientErrors = validateProfileForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return false;
    }

    setSaving(true);
    setFieldErrors({});

    const applyUser = (next: AuthUser) => {
      setUser(next);
      setValues(profileFormFromUser(next));
    };

    try {
      const updated = await updateCurrentProfile({
        fullname: values.fullname.trim(),
        companyName: values.companyName.trim(),
        country: values.country.trim(),
        phoneWhatsapp: values.phoneWhatsapp.trim(),
      });
      applyUser(updated);
      message.success("Profile updated.");
      return true;
    } catch (cause) {
      if (cause instanceof ProfileRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return false;
      }

      if (cause instanceof ProfileRequestError && cause.status === 401) {
        if (isPreviewAccessToken()) {
          applyUser(saveProfileLocally(values));
          message.success("Profile saved for this session.");
          return true;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Unable to update your profile. Please try again."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, [navigate, values]);

  return {
    user,
    values,
    setField,
    fieldErrors,
    saving,
    refreshing,
    save,
  };
}
