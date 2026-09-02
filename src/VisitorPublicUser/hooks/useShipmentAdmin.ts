import { useEffect, useState } from "react";
import axios from "axios";

export interface ShipmentUpdate {
  update_id: string;
  shipment: string;
  location: string;
  status: string;
  remarks: string;
  update_time: string;
}

export interface Shipment {
  _id: string;
  pickupLocation: string;
  destinationCountry: string;
  destinationCity: string;
  goodsDescription: string;
  shippingMethod: "sea" | "air" | "express";
  trackingNumber?: string;
  status: "booked" | "in-transit" | "at-port" | "customs" | "delivered";
  estimatedDeliveryDate?: string;
  assignedLogistic?: string;
  weight?: number;
  volume?: number;
  updates?: ShipmentUpdate[];
  createdAt: string;
}

const API = "http://localhost:5000/api/shipments";

export const useShipmentAdmin = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  /* ================= FETCH ALL SHIPMENTS ================= */
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, { headers });
      setShipments(res.data.data || []);
    } catch (err) {
      console.error("Fetch shipments failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SHIPMENT BY ID ================= */
  const getShipmentById = async (id: string): Promise<Shipment | null> => {
    try {
      const res = await axios.get(`${API}/${id}`, { headers });
      return res.data.data;
    } catch (err) {
      console.error("Get shipment failed:", err);
      return null;
    }
  };

  /* ================= ASSIGN LOGISTICS STAFF ================= */
  const assignLogistic = async (id: string, staffId: string) => {
    try {
      const res = await axios.patch(`${API}/${id}/assign`, { staffId }, { headers });
      setShipments((prev) =>
        prev.map((s) => (s._id === id ? res.data.data : s))
      );
      return res.data.data;
    } catch (err) {
      console.error("Assign logistic failed:", err);
    }
  };

  /* ================= GENERATE TRACKING NUMBER ================= */
  const generateTracking = async (id: string) => {
    try {
      const res = await axios.patch(`${API}/${id}/generate-tracking`, {}, { headers });
      setShipments((prev) =>
        prev.map((s) => (s._id === id ? res.data.data : s))
      );
      return res.data.data;
    } catch (err) {
      console.error("Generate tracking failed:", err);
    }
  };

  /* ================= UPDATE SHIPMENT ================= */
  const updateShipment = async (id: string, payload: any) => {
    try {
      const res = await axios.patch(`${API}/${id}`, payload, { headers });
      setShipments((prev) =>
        prev.map((s) => (s._id === id ? res.data.data : s))
      );
      return res.data.data;
    } catch (err) {
      console.error("Update shipment failed:", err);
    }
  };

  /* ================= ADD SHIPMENT UPDATE ================= */
  const addShipmentUpdate = async (
    id: string,
    { location, status, remarks }: { location: string; status: string; remarks?: string }
  ) => {
    try {
      const res = await axios.post(`${API}/${id}/updates`, { location, status, remarks }, { headers });
      // Update local shipment state
      setShipments((prev) =>
        prev.map((s) =>
          s._id === id
            ? { ...s, updates: [...(s.updates || []), res.data.data] }
            : s
        )
      );
      return res.data.data;
    } catch (err) {
      console.error("Add shipment update failed:", err);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return {
    shipments,
    loading,
    getShipmentById,
    assignLogistic,
    generateTracking,
    updateShipment,
    addShipmentUpdate,
    fetchShipments,
  };
};
