import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

/* ===================== TYPES ===================== */

export type InspectionStatus = "pending" | "completed";

export interface InspectionUser {
  _id: string;
  fullName: string;
  email: string;
  country: string;
  phone: string;
  profileImage?: string;
}

export interface Inspection {
  _id: string;
  user: InspectionUser;
  productType: string;
  inspectionType: string;
  inspectionDate: string;
  photoVideoRequired: boolean;
  status: InspectionStatus;
  remarks?: string;
  reportUrl?: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface InspectionListResponse {
  success: boolean;
  count: number;
  pagination: Pagination;
  data: Inspection[];
}

interface ApiErrorResponse {
  message?: string;
}

/* ===================== CONFIG ===================== */

const BASE_URL = "http://localhost:5000/api/inspections";

/* ===================== HOOK ===================== */

export const useInspectionsAdmin = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ========= FETCH INSPECTIONS ========= */
  const fetchInspections = useCallback(
    async (page = 1, limit = 10) => {
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
        const { data } = await axios.get<InspectionListResponse>(
          `${BASE_URL}?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );

        setInspections(data.data);
        setPagination(data.pagination);
      } catch (err: unknown) {
        const error = err as AxiosError<ApiErrorResponse>;
        if (error.response?.status === 401) {
          message.error("Unauthorized. Please login as admin.");
          navigate("/admin/login");
        } else {
          message.error(error.response?.data?.message || "Failed to load inspections");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /* ========= UPDATE INSPECTION ========= */
  const updateInspection = async (
    inspectionId: string,
    payload: { status: InspectionStatus; remarks?: string }
  ) => {
    setLoading(true);

    const adminToken = localStorage.getItem("admin_token") || localStorage.getItem("token");

    if (!adminToken) {
      message.error("Admin authentication required. Redirecting to login...");
      navigate("/admin/login");
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${BASE_URL}/${inspectionId}`, payload, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      message.success("Inspection updated successfully");
      fetchInspections(pagination?.currentPage ?? 1);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (error.response?.status === 401) {
        message.error("Unauthorized. Please login as admin.");
        navigate("/admin/login");
      } else {
        message.error(error.response?.data?.message || "Failed to update inspection");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ========= DELETE INSPECTION ========= */
  const deleteInspection = async (inspectionId: string) => {
    setLoading(true);

    const adminToken = localStorage.getItem("admin_token") || localStorage.getItem("token");

    if (!adminToken) {
      message.error("Admin authentication required. Redirecting to login...");
      navigate("/admin/login");
      setLoading(false);
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/${inspectionId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      message.success("Inspection deleted successfully");
      fetchInspections(pagination?.currentPage ?? 1);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (error.response?.status === 401) {
        message.error("Unauthorized. Please login as admin.");
        navigate("/admin/login");
      } else {
        message.error(error.response?.data?.message || "Failed to delete inspection");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ========= INITIAL LOAD ========= */
  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  return {
    inspections,
    pagination,
    loading,
    fetchInspections,
    updateInspection,
    deleteInspection,
  };
};
