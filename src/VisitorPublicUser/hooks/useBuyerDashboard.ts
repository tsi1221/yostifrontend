import { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import type {
    SourcingRequest,
    Shipment,
    CreateSourcingPayload,
} from "../../../../Downloads/Telegram Desktop/new yosti/src/pages/buyer/sourcing";

interface Stats {
  activeRequests: number;
  shipmentsInTransit: number;
  pendingInspections: number;
}

export const useBuyerDashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeRequests: 0,
    shipmentsInTransit: 0,
    pendingInspections: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, shipRes] = await Promise.all([
        api.get("/api/sourcing/myrequests"),
        api.get("/api/shipments/myshipments"),
      ]);

      const reqData: SourcingRequest[] = reqRes.data.data;
      const shipData: Shipment[] = shipRes.data.data;

      setRequests(reqData);
      setShipments(shipData);
      setStats({
        activeRequests: reqData.length,
        shipmentsInTransit: shipData.filter(
          (s) => s.status === "In Transit"
        ).length,
        pendingInspections: shipData.filter(
          (s) => s.status === "Pending Inspection"
        ).length,
      });

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSourcingRequest = async (
    payload: CreateSourcingPayload
  ): Promise<SourcingRequest> => {
    const res = await api.post("/api/sourcing", payload);
    const created: SourcingRequest = res.data.data;

    // Optimistic-safe refresh
    setRequests((prev) => [created, ...prev]);
    setStats((prev) => ({
      ...prev,
      activeRequests: prev.activeRequests + 1,
    }));

    return created;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    requests,
    shipments,
    stats,
    createSourcingRequest,
    refreshData: fetchData,
  };
};
