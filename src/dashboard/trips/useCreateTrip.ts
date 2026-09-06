import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TripFieldErrors, TripFormValues } from "./types";
import {
  TripsRequestError,
  createTrip,
  formValuesToPayload,
  isPreviewAccessToken,
  validateTripForm,
} from "./tripsService";

export function useCreateTrip() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TripFieldErrors>({});

  const submitTrip = async (values: TripFormValues) => {
    const clientErrors = validateTripForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const created = await createTrip(formValuesToPayload(values));
      message.success("Trip created successfully.");
      return created;
    } catch (cause) {
      if (cause instanceof TripsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof TripsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to create a trip.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof TripsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create trip."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitTrip, saving, conflict, fieldErrors };
}
