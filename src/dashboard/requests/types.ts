export type RequestRegion = "Yiwu" | "Shenzhen";

export interface SourcingRequestRecord {
  id: string;
  productName: string;
  description: string;
  quantity: number;
  targetPrice: number;
  supplierRegion: RequestRegion | string;
  deadline: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestsListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestsListResponse {
  data: SourcingRequestRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestsListQuery {
  page: number;
  pageSize: number;
  search: string;
  supplierRegion: RequestRegion | "";
  deadline: string;
}

export const DEFAULT_REQUESTS_QUERY: RequestsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  supplierRegion: "",
  deadline: "",
};

export const REQUEST_REGIONS: RequestRegion[] = ["Yiwu", "Shenzhen"];

export const REQUEST_STATUSES = ["open", "Quoted", "completed", "closed"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface RequestUpdatePayload {
  productName?: string;
  description?: string;
  quantity?: number;
  targetPrice?: string;
  supplierRegion?: RequestRegion;
  deadline?: string;
  status?: string;
}

export interface RequestFormValues {
  productName: string;
  description: string;
  quantity: string;
  targetPrice: string;
  supplierRegion: RequestRegion;
  deadline: string;
  status: string;
}

export type RequestFieldErrors = Partial<Record<keyof RequestUpdatePayload, string>>;
