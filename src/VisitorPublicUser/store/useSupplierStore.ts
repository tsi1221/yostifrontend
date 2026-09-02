// src/store/useSupplierStore.ts
import { create } from "zustand";

// Define types
interface PieDataItem {
  name: string;
  value: number;
}

interface BarDataItem {
  month: string;
  orders: number;
}

interface SupplierStore {
  totalRFQs: number;
  pendingQuotes: number;
  activeOrders: number;
  inspectionRequests: number;

  pieData: PieDataItem[];
  barData: BarDataItem[];

  // Actions to update mock data
  setTotalRFQs: (value: number) => void;
  setPendingQuotes: (value: number) => void;
  setActiveOrders: (value: number) => void;
  setInspectionRequests: (value: number) => void;

  setPieData: (data: PieDataItem[]) => void;
  setBarData: (data: BarDataItem[]) => void;
}

// Create store
export const useSupplierStore = create<SupplierStore>((set) => ({
  totalRFQs: 45,
  pendingQuotes: 12,
  activeOrders: 8,
  inspectionRequests: 3,

  pieData: [
    { name: "Approved", value: 30 },
    { name: "Pending", value: 12 },
    { name: "Rejected", value: 3 },
  ],

  barData: [
    { month: "Jan", orders: 4 },
    { month: "Feb", orders: 6 },
    { month: "Mar", orders: 5 },
    { month: "Apr", orders: 8 },
    { month: "May", orders: 7 },
  ],

  setTotalRFQs: (value) => set({ totalRFQs: value }),
  setPendingQuotes: (value) => set({ pendingQuotes: value }),
  setActiveOrders: (value) => set({ activeOrders: value }),
  setInspectionRequests: (value) => set({ inspectionRequests: value }),
  setPieData: (data) => set({ pieData: data }),
  setBarData: (data) => set({ barData: data }),
}));
