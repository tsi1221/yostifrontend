import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message } from "antd";

export type TripStatus = "planned" | "ongoing" | "completed";

export interface BusinessTrip {
  _id: string;
  user: string;
  arrivalCity: string;
  arrivalDate: string;
  durationDays: number;
  hotelBooking: boolean;
  transport: boolean;
  translator: boolean;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewTripPayload {
  user: string;
  arrivalCity: string;
  arrivalDate: string; // YYYY-MM-DD
  durationDays: number;
  hotelBooking: boolean;
  transport: boolean;
  translator: boolean;
}

// Define the shape of your backend error response
interface ErrorResponse {
  message?: string;
}

const BASE_URL = "http://localhost:5000";

export function useTrips() {
  const [trips, setTrips] = useState<BusinessTrip[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<{ success: boolean; data: BusinessTrip[] }>(
        `${BASE_URL}/api/trips/mytrips`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) setTrips(res.data.data);
    } catch (err: unknown) {
      const error = err as AxiosError<ErrorResponse>;
      console.error(error);
      message.error(error.response?.data?.message || "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }, []);

  const addTrip = useCallback(
    async (trip: NewTripPayload) => {
      try {
        const res = await axios.post<{ success: boolean; data: BusinessTrip }>(
          `${BASE_URL}/api/trips`,
          trip,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.data.success) {
          setTrips((prev) => [res.data.data, ...prev]);
          message.success("Business trip requested successfully!");
        }
      } catch (err: unknown) {
        const error = err as AxiosError<ErrorResponse>;
        console.error(error);
        message.error(error.response?.data?.message || "Failed to request trip");
      }
    },
    []
  );

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, fetchTrips, addTrip };
}
