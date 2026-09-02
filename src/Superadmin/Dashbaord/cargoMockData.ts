export type CargoStatus =
  | "IN TRANSIT"
  | "CUSTOMS"
  | "DELIVERED"
  | "PENDING";

export type CargoMode = "SEA" | "AIR" | "ROAD";

export interface CargoItem {
  id: string;
  code: string;
  status: CargoStatus;
  mode: CargoMode;
  eta: string;
  title: string;
  origin: string;
  destination: string;
  weightKg: number;
  volumeCbm: number;
}

export const cargoData: CargoItem[] = [
  {
    id: "1",
    code: "YOSTI-SEA-ET-8842",
    status: "IN TRANSIT",
    mode: "SEA",
    eta: "2026-09-18",
    title:
      "300x 5.5kVA Hybrid Solar Inverters & 60x Lithium Battery Packs",
    origin: "Yiwu International Logistics Center",
    destination: "Addis Ababa, Kality Dry Port, Ethiopia",
    weightKg: 4850,
    volumeCbm: 16.4,
  },
  {
    id: "2",
    code: "YOSTI-AIR-UG-3319",
    status: "CUSTOMS",
    mode: "AIR",
    eta: "2026-09-03",
    title:
      "150x Industrial Vibrator Sets & Construction Tool Spares",
    origin: "Guangzhou Baiyun Cargo Hub",
    destination: "Kampala, Nakawa ICD, Uganda",
    weightKg: 1820,
    volumeCbm: 6.8,
  },
];