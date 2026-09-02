// src/data/sourcingData.ts

export interface SourcingRequest {
  request_id: string;
  product_name: string;
  description: string;
  quantity: number;
  target_price: number;
  supplier_region: string;
  deadline: string;
  status: "open" | "quoted" | "completed";
}

// --- Expanded Mock Data (12 items) ---
export const sourcingData: SourcingRequest[] = [
  {
    request_id: "REQ001",
    product_name: "LED Bulbs",
    description: "Energy-saving 9W bulbs with E27 base",
    quantity: 1000,
    target_price: 2.5,
    supplier_region: "Yiwu",
    deadline: "2025-11-08",
    status: "open",
  },
  {
    request_id: "REQ002",
    product_name: "Plastic Chairs",
    description: "Durable stackable outdoor chairs",
    quantity: 500,
    target_price: 6,
    supplier_region: "Guangzhou",
    deadline: "2025-11-10",
    status: "quoted",
  },
  {
    request_id: "REQ003",
    product_name: "Power Banks",
    description: "10,000mAh with USB-C fast charging",
    quantity: 300,
    target_price: 9.5,
    supplier_region: "Shenzhen",
    deadline: "2025-11-03",
    status: "completed",
  },
  {
    request_id: "REQ004",
    product_name: "Cotton T-Shirts",
    description: "100% cotton unisex T-shirts, assorted sizes",
    quantity: 800,
    target_price: 3.2,
    supplier_region: "Hangzhou",
    deadline: "2025-11-15",
    status: "open",
  },
  {
    request_id: "REQ005",
    product_name: "Bluetooth Speakers",
    description: "Portable waterproof Bluetooth speakers",
    quantity: 250,
    target_price: 12,
    supplier_region: "Shenzhen",
    deadline: "2025-11-12",
    status: "quoted",
  },
  {
    request_id: "REQ006",
    product_name: "Solar Panels",
    description: "150W polycrystalline solar panels",
    quantity: 150,
    target_price: 45,
    supplier_region: "Ningbo",
    deadline: "2025-11-22",
    status: "open",
  },
  {
    request_id: "REQ007",
    product_name: "Plastic Bottles",
    description: "500ml PET bottles for beverage packaging",
    quantity: 5000,
    target_price: 0.25,
    supplier_region: "Jinhua",
    deadline: "2025-11-25",
    status: "completed",
  },
  {
    request_id: "REQ008",
    product_name: "Laptop Bags",
    description: "Waterproof polyester laptop bags 15-inch",
    quantity: 400,
    target_price: 8.5,
    supplier_region: "Yiwu",
    deadline: "2025-11-13",
    status: "quoted",
  },
  {
    request_id: "REQ009",
    product_name: "Kitchen Utensil Sets",
    description: "10-piece stainless steel kitchen utensil set",
    quantity: 350,
    target_price: 15,
    supplier_region: "Guangzhou",
    deadline: "2025-11-18",
    status: "open",
  },
  {
    request_id: "REQ010",
    product_name: "Smart Watches",
    description: "Touchscreen smart watches with heart rate monitor",
    quantity: 200,
    target_price: 22,
    supplier_region: "Shenzhen",
    deadline: "2025-11-16",
    status: "completed",
  },
  {
    request_id: "REQ011",
    product_name: "Office Desks",
    description: "Ergonomic adjustable-height office desks",
    quantity: 120,
    target_price: 80,
    supplier_region: "Dongguan",
    deadline: "2025-11-19",
    status: "quoted",
  },
  {
    request_id: "REQ012",
    product_name: "Reusable Water Bottles",
    description: "Eco-friendly stainless steel bottles, 750ml",
    quantity: 600,
    target_price: 5,
    supplier_region: "Yiwu",
    deadline: "2025-11-23",
    status: "open",
  },
];
