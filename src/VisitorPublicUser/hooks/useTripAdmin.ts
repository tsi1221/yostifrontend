import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message } from "antd";

export type TripStatus = "planned" | "ongoing" | "completed";

export interface User {
  _id: string;
  fullName: string;
  companyName?: string;
  country: string;
  phone: string;
  email: string;
  accountType: string;
  languagePreference: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  profileImage?: string;
}

export interface BusinessTrip {
  _id: string;
  user: User | string;
  arrivalCity: string;
  arrivalDate: string;
  durationDays: number;
  hotelBooking: boolean;
  transport: boolean;
  translator: boolean;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TripApiResponse {
  success: boolean;
  count: number;
  pagination: Pagination;
  data: BusinessTrip[];
}

const BASE_URL = "http://localhost:5000";

export function useTripAdmin() {
  const [trips, setTrips] = useState<BusinessTrip[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    localStorage.getItem("admin_token") || localStorage.getItem("token");

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<TripApiResponse>(`${BASE_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.data.success) setTrips(res.data.data);
    } catch (err) {
      const error = err as AxiosError;
      console.error(error);
      message.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTripStatus = useCallback(
    async (tripId: string, status: TripStatus) => {
      try {
        const res = await axios.put<{ success: boolean; data: BusinessTrip }>(
          `${BASE_URL}/api/trips/${tripId}`,
          { status },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );

        if (res.data.success) {
          setTrips(prev =>
            prev.map(trip => (trip._id === tripId ? res.data.data : trip))
          );
          message.success(`Trip status updated to ${status}`);
        }
      } catch (err) {
        const error = err as AxiosError;
        console.error(error);
        message.error("Failed to update trip status");
      }
    },
    []
  );

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, fetchTrips, updateTripStatus };
}
