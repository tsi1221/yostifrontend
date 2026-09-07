import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import type { TripRecord } from "./types";
import { TripsRequestError, fetchTrip, parseTripId } from "./tripsService";

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
        expireSession(navigate);
        return;
      }

      if (cause instanceof TripsRequestError && cause.status === 403) {
        setServerError(FORBIDDEN_MESSAGE);
        return;
      }

      if (cause instanceof TripsRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error
          ? cause.message
          : "We couldn't load this trip itinerary.";
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
