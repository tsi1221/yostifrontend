import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

/* ===================== TYPES ===================== */

export type InspectionStatus = "pending" | "completed";

export interface Inspection {
  _id: string;
  user: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  productType: string;
  inspectionType: string;
  inspectionDate: string;
  photoVideoRequired: boolean;
  status: InspectionStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiErrorResponse {
  message?: string;
}

interface InspectionResponse {
  success: boolean;
  data: Inspection;
}

/* ===================== CONFIG ===================== */

const BASE_URL = "http://localhost:5000/api/inspections";

/* ===================== HOOK ===================== */

export const useInspection = () => {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ========= FETCH INSPECTION BY ID ========= */
  const fetchInspection = useCallback(
    async (inspectionId: string) => {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Authentication required. Redirecting to login...");
        navigate("/login");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get<InspectionResponse>(`${BASE_URL}/${inspectionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInspection(res.data.data);
      } catch (err: unknown) {
        const error = err as AxiosError<ApiErrorResponse>;
        if (error.response?.status === 401) {
          message.error("Unauthorized. Please login.");
          navigate("/login");
        } else {
          message.error(error.response?.data?.message || "Failed to fetch inspection");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /* ========= CREATE NEW INSPECTION ========= */
  const createInspection = useCallback(
    async (payload: {
      productType: string;
      inspectionType: string;
      inspectionDate: string;
      photoVideoRequired: boolean;
    }) => {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Authentication required. Redirecting to login...");
        navigate("/login");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post<InspectionResponse>(BASE_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        message.success("Inspection request submitted successfully");
        setInspection(res.data.data);
      } catch (err: unknown) {
        const error = err as AxiosError<ApiErrorResponse>;
        if (error.response?.status === 401) {
          message.error("Unauthorized. Please login.");
          navigate("/login");
        } else {
          message.error(error.response?.data?.message || "Failed to create inspection");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return {
    inspection,
    loading,
    fetchInspection,
    createInspection,
  };
};
