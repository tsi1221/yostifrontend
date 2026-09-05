import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TripRecord } from "./types";
import {
  TripsRequestError,
  fetchTrip,
  isPreviewAccessToken,
  parseTripId,
} from "./tripsService";

export function useTripDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const tripId = parseTripId(id);
    if (tripId === undefined) {
      setTrip(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchTrip(tripId);
      setTrip(payload);
    } catch (cause) {
      setTrip(null);

      if (cause instanceof TripsRequestError && cause.status === 400) {
        message.error(cause.message);
        setServerError(cause.message);
        return;
      }

      if (cause instanceof TripsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load this trip itinerary.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof TripsRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error
          ? cause.message
          : "The server could not load this trip itinerary.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  return {
    trip,
    loading,
    notFound,
    serverError,
    applyTrip: setTrip,
    retry: () => setReloadToken((value) => value + 1),
  };
}
