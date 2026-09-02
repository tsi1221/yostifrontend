import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message as antdMessage } from "antd";

export type InvitationStatus = "pending" | "approved" | "rejected";

export interface Invitation {
  _id: string;
  user: string;
  passportNumber: string;
  nationality: string;
  plannedArrivalDate: string;
  durationDays: number;
  purpose: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const BASE_URL = "http://localhost:5000";

// Safe wrapper to show messages without warnings
const showMessage = (msg: string, type: "success" | "error" = "success") => {
  if (typeof window !== "undefined") {
    if (type === "success") {
      antdMessage.success(msg);
    } else {
      antdMessage.error(msg);
    }
  }
};

export const useVisaAdmin = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all invitations
  const fetchAllInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<ApiResponse<Invitation[]>>(
        `${BASE_URL}/api/trips/invitations`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) setInvitations(res.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 403 ? "Forbidden" : "Failed to fetch invitations");
      showMessage(msg, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch invitation by ID
  const fetchInvitationById = useCallback(
    async (invitationId: string): Promise<Invitation | null> => {
      setLoading(true);
      try {
        const res = await axios.get<ApiResponse<Invitation>>(
          `${BASE_URL}/api/trips/invitations/${invitationId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        if (res.data.success) return res.data.data;
        return null;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        const msg =
          error.response?.data?.message ||
          (error.response?.status === 403 ? "Forbidden" : "Failed to fetch invitation");
        showMessage(msg, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update invitation status using PUT
  const updateInvitationStatus = useCallback(
    async (invitationId: string, status: Exclude<InvitationStatus, "pending">) => {
      setLoading(true);
      try {
        const res = await axios.put<ApiResponse<Invitation>>(
          `${BASE_URL}/api/trips/invitations/${invitationId}`,
          { status },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (res.data.success) {
          // Update local state
          setInvitations((prev) =>
            prev.map((inv) => (inv._id === invitationId ? res.data.data : inv))
          );
          showMessage(`Invitation status updated to ${status}`, "success");
        }
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        let msg = error.response?.data?.message || "Failed to update status";

        if (error.response?.status === 404) msg = "Invitation not found";
        if (error.response?.status === 403) msg = "You are not authorized";

        showMessage(msg, "error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    invitations,
    loading,
    fetchAllInvitations,
    fetchInvitationById,
    updateInvitationStatus,
  };
};
