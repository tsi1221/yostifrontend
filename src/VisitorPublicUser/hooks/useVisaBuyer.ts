import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message } from "antd";

export type InvitationStatus = "pending" | "approved" | "rejected";

export interface VisaInvitation {
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
  __v: number;
}

export interface VisaApiResponse {
  success: boolean;
  count: number;
  data: VisaInvitation[];
}

const BASE_URL = "http://localhost:5000";

export function useVisaBuyer() {
  const [invitations, setInvitations] = useState<VisaInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // buyer token

  // Fetch buyer invitations
  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<VisaApiResponse>(
        `${BASE_URL}/api/trips/invitations/myinvitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setInvitations(res.data.data);
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error(error);
      message.error("Failed to fetch invitations");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Post a new visa invitation
  const requestInvitation = useCallback(
    async (invitation: Omit<VisaInvitation, "_id" | "user" | "status" | "createdAt" | "updatedAt" | "__v">) => {
      try {
        const res = await axios.post<{ success: boolean; data: VisaInvitation }>(
          `${BASE_URL}/api/trips/invitations`,
          invitation,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setInvitations(prev => [res.data.data, ...prev]);
          message.success("Visa invitation requested successfully!");
        }
      } catch (err) {
        const error = err as AxiosError;
        console.error(error);
        message.error("Failed to request invitation");
      }
    },
    [token]
  );

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return { invitations, loading, fetchInvitations, requestInvitation };
}
