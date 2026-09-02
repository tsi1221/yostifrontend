import { create } from "zustand";

interface SourcingRequest {
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

interface Quote {
  price: number;
  moq: number;
  lead_time: string;
  notes?: string;
}

interface SupplierStore {
  sourcingRequests: SourcingRequest[];

  submitQuote: (request_id: string, quote?: Quote) => void;
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  sourcingRequests: [
    {
      request_id: "REQ001",
      product_name: "iPhone Charger",
      description: "Fast charging, compatible with iPhone 12+",
      quantity: 500,
      target_price: 5,
      supplier_region: "Yiwu",
      sample_required: true,
      deadline: "2025-12-05",
      status: "open",
      created_at: "2025-11-20",
    },
    {
      request_id: "REQ002",
      product_name: "Bluetooth Earbuds",
      description: "Noise cancelling, black color",
      quantity: 300,
      target_price: 12,
      supplier_region: "Guangzhou",
      sample_required: false,
      deadline: "2025-12-10",
      status: "open",
      created_at: "2025-11-22",
    },
  ],

  submitQuote: (request_id) => {
    // Mock: mark request as quoted
    set({
      sourcingRequests: get().sourcingRequests.map((r) =>
        r.request_id === request_id ? { ...r, status: "quoted" } : r
      ),
    });
  },
}));
