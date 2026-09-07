import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { TripFieldErrors, UpdateTripFormValues } from "./types";
import {
  TripsRequestError,
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
        expireSession(navigate);
        return null;
      }

      if (cause instanceof TripsRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
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
          : "Server error occurred. Could not update trip.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateTrip, saving, conflict, fieldErrors };
}
