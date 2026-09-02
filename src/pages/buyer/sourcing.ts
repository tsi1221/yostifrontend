export type SourcingStatus = "open" | "closed" | "in_progress";

export interface SourcingRequest {
  _id: string;
  user: string;
  productName: string;
  description: string;
  quantity: number;
  targetPrice: number;
  supplierRegion: string;
  sampleRequired: boolean;
  status: SourcingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourcingPayload {
  productName: string;
  description: string;
  quantity: number;
  targetPrice: number;
  supplierRegion: string;
  sampleRequired: boolean;
}

export interface Shipment {
  _id: string;
  trackingId?: string;
  origin: string;
  destination: string;
  status: string;
  progress: number;
}
