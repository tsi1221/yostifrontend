// src/hooks/useSupportAdmin.ts
import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

/* ===================== TYPES ===================== */

export type SupportStatus = "open" | "in-progress" | "resolved" | "closed";
export type Urgency = "low" | "medium" | "high";
export type IssueType = "damage" | "missing" | "defect" | "other";

export interface SupportUser {
  _id: string;
  fullName: string;
  companyName?: string;
  country: string;
  phone: string;
  email: string;
  accountType: string;
  profileImage?: string;
}

export interface SupportItem {
  _id: string;
  user: SupportUser;
  orderReference: string;
  issueType: IssueType;
  description: string;
  resolutionRequested: string;
  urgency: Urgency;
  status: SupportStatus;
  createdAt: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface SupportApiResponse {
  success: boolean;
  count: number;
  pagination: Pagination;
  data: SupportItem[];
}

export interface ApiErrorResponse {
  message?: string;
}

/* ===================== HOOK ===================== */

const BASE_URL = "http://localhost:5000/api/support";

export const useSupportAdmin = () => {
  const [data, setData] = useState<SupportItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchSupport = useCallback(
    async (page = 1, limit = 10): Promise<void> => {
      setLoading(true);

      // Get admin token from localStorage, fallback to normal token
      const adminToken = localStorage.getItem("admin_token") || localStorage.getItem("token");

      if (!adminToken) {
        message.error("Admin authentication required. Redirecting to login...");
        navigate("/admin/login");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get<SupportApiResponse>(
          `${BASE_URL}?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );

        setData(res.data.data);
        setPagination(res.data.pagination);
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response?.status === 401) {
          message.error("Unauthorized. Please login as admin.");
          navigate("/admin/login");
        } else {
          message.error(
            axiosError.response?.data?.message ?? "Failed to load support requests"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchSupport();
  }, [fetchSupport]);

  return { data, pagination, loading, fetchSupport };
};
