import { create } from "zustand";

export interface SourcingRequest {
  request_id: string;
  product_name: string;
  description: string;
  quantity: number;
  target_price: number;
  supplier_region: string;
  sample_required: boolean;
  deadline: string;
  status: "open" | "quoted" | "completed";
  created_at: string;
}

export interface SupplierQuote {
  quote_id: string;
  request_id: string;
  supplier: string;
  price: number;
  moq: number;
  lead_time: string;
  notes: string;
  created_at: string;
  status: "pending" | "accepted" | "rejected";
}

interface SupplierStore {
  openRequests: SourcingRequest[];
  myQuotes: SupplierQuote[];
  submitQuote: (quote: SupplierQuote) => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  openRequests: [
    { request_id: "REQ-001", product_name: "iPhone Charger", description: "Fast charging, 20W", quantity: 500, target_price: 2.5, supplier_region: "Yiwu", sample_required: true, deadline: "2025-12-05", status: "open", created_at: "2025-10-01" },
    { request_id: "REQ-002", product_name: "USB Cable", description: "Type-C, 1m", quantity: 1000, target_price: 1.2, supplier_region: "Guangzhou", sample_required: false, deadline: "2025-12-10", status: "open", created_at: "2025-11-01" },
  ],
  myQuotes: [],
  submitQuote: (quote) => set((state) => ({
    myQuotes: [...state.myQuotes, quote],
    openRequests: state.openRequests.map(r => r.request_id === quote.request_id ? { ...r, status: "quoted" } : r),
  })),
}));
