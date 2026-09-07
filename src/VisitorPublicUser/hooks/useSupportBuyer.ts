// src/hooks/useSupportBuyer.ts
import { useEffect, useState, useCallback } from "react";
import api from "../api/api";

/* -------------------- Types -------------------- */

export interface SupportRequest {
  _id: string;
  user: string;
  orderReference: string;
  issueType: "defect" | "damage" | "missing" | "other";
  description: string;
  resolutionRequested: "refund" | "replacement" | "repair";
  urgency: "low" | "medium" | "high";
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  photoVideoUrl?: string;
}

type CreateSupportRequest = Pick<
  SupportRequest,
  "orderReference" | "issueType" | "description" | "resolutionRequested" | "urgency"
>;

interface ApiListResponse {
  success: boolean;
  data: SupportRequest[];
}

interface ApiSingleResponse {
  success: boolean;
  data: SupportRequest;
}

/* -------------------- Hook -------------------- */

export const useSupportBuyer = (_myTicketsOnly: boolean = true) => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = "/supports";

      const res = await api.get<ApiListResponse>(endpoint);

      const normalized = res.data.data.map((ticket: SupportRequest) => ({
        ...ticket,
        status: ticket.status.toUpperCase() as SupportRequest["status"],
      }));

      setRequests(normalized);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = async (
    payload: CreateSupportRequest
  ): Promise<SupportRequest> => {
    try {
      const res = await api.post<ApiSingleResponse>("/supports", payload);
      const created = {
        ...res.data.data,
        status: res.data.data.status.toUpperCase() as SupportRequest["status"],
      };

      setRequests((prev) => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("Failed to submit support request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    submitRequest,
  };
};
