import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TripFieldErrors, UpdateTripFormValues } from "./types";
import {
  TripsRequestError,
  isPreviewAccessToken,
  patchTrip,
  updateFormValuesToPayload,
  validateUpdateTripForm,
} from "./tripsService";

export function useUpdateTrip(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<TripFieldErrors>({});

  const updateTrip = async (values: UpdateTripFormValues) => {
    const clientErrors = validateUpdateTripForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setFieldErrors({});

    try {
      const updated = await patchTrip(id, updateFormValuesToPayload(values));
      message.success("Trip updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof TripsRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof TripsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to update this trip.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof TripsRequestError && cause.status === 404) {
        message.warning("This trip could not be found or has been removed.");
        return null;
      }

      if (cause instanceof TripsRequestError && cause.status === 409) {
        setConflict(cause.message);
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update trip."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateTrip, saving, conflict, fieldErrors };
}
