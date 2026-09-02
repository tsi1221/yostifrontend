import { useEffect, useState, useCallback } from "react";
import api from "../api/api";

/* =======================
   Domain Types
======================= */
export type ShipmentStatus =
  | "booked"
  | "at-port"
  | "in-transit"
  | "customs"
  | "delivered"
  | "cancelled";

export type ShippingMethod = "sea" | "air" | "express";

export interface ShipmentUpdate {
  _id: string;
  location: string;
  status: ShipmentStatus;
  remarks?: string;
  updateTime: string;
}

export interface Shipment {
  _id: string;
  user: string;
  pickupLocation: string;
  destinationCountry: string;
  destinationCity: string;
  goodsDescription: string;
  weight?: string;
  volume?: string;
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  status: ShipmentStatus;
  updates?: ShipmentUpdate[];
  createdAt: string;
  updatedAt: string;
}

/* =======================
   Input DTOs
======================= */
export interface CreateShipmentInput {
  pickupLocation: string;
  destinationCountry: string;
  destinationCity: string;
  goodsDescription: string;
  weight: number;
  volume?: number;
  shippingMethod: ShippingMethod;
}

export interface UpdateShipmentInput {
  pickupLocation?: string;
  destinationCountry?: string;
  destinationCity?: string;
  goodsDescription?: string;
  weight?: number;
  volume?: number;
  shippingMethod?: ShippingMethod;
  status?: ShipmentStatus;
}

/* =======================
   Hook
======================= */
const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchShipments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: Shipment[] }>("/api/shipments/myshipments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShipments(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch shipments", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createShipment = useCallback(
    async (values: CreateShipmentInput) => {
      const tempShipment: Shipment = {
        _id: `temp-${Date.now()}`,
        user: "me",
        pickupLocation: values.pickupLocation,
        destinationCountry: values.destinationCountry,
        destinationCity: values.destinationCity,
        goodsDescription: values.goodsDescription,
        weight: `${values.weight} kg`,
        volume: `${values.volume ?? 0} m³`,
        shippingMethod: values.shippingMethod,
        trackingNumber: "PENDING",
        status: "booked",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setShipments((prev) => [tempShipment, ...prev]);

      try {
        const res = await api.post<{ data: Shipment }>("/api/shipments", values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShipments((prev) =>
          prev.map((s) => (s._id === tempShipment._id ? res.data.data : s))
        );
      } catch (error) {
        setShipments((prev) => prev.filter((s) => s._id !== tempShipment._id));
        console.error("Failed to create shipment", error);
        throw error;
      }
    },
    [token]
  );

  const getShipmentById = useCallback(
    async (id: string) => {
      const res = await api.get<{ data: Shipment }>(`/api/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    },
    [token]
  );

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return {
    shipments,
    loading,
    createShipment,
    getShipmentById,
  };
};

export default useShipments;
