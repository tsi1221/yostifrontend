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
