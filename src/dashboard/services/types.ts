/**
 * Catalog service tiers. No existing service-tier enum was found in the repo
 * (homepage services, mocks, and Super Admin stubs are untitled offerings).
 * These exact strings are sent as `details.tier`.
 */
export type ServiceTierValue = "Basic" | "Standard" | "Premium";

export const SERVICE_TIER_VALUES: ServiceTierValue[] = [
  "Basic",
  "Standard",
  "Premium",
];

export const SERVICE_TIER_OPTIONS: {
  label: string;
  value: ServiceTierValue;
}[] = [
  { label: "Basic", value: "Basic" },
  { label: "Standard", value: "Standard" },
  { label: "Premium", value: "Premium" },
];

export interface ServiceDetails {
  tier: string;
  support247: boolean;
  features: string[];
}

export interface CreateServicePayload {
  title: string;
  logo: string;
  details: ServiceDetails;
}

export interface UpdateServiceDetails {
  tier?: string;
  support247?: boolean;
  features?: string[];
}

export interface UpdateServicePayload {
  title?: string;
  logo?: string;
  details?: UpdateServiceDetails;
}

export interface ServiceRecord extends CreateServicePayload {
  id: number;
}

export interface ServiceFormValues {
  title: string;
  logo: string;
  tier: ServiceTierValue | "";
  support247: boolean;
  features: string[];
}

export type ServiceFieldErrors = Partial<
  Record<"title" | "logo" | "tier" | "support247" | "features" | "details", string>
>;

export const EMPTY_SERVICE_FORM: ServiceFormValues = {
  title: "",
  logo: "",
  tier: "",
  support247: false,
  features: [""],
};

export interface CreateServiceResult {
  record: ServiceRecord;
  message: string;
}

export interface ServicesListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ServicesListResponse {
  data: ServiceRecord[];
  meta: ServicesListMeta;
}

export interface ServicesListQuery {
  page: number;
  pageSize: number;
  search: string;
  title: string;
}

export const DEFAULT_SERVICES_QUERY: ServicesListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  title: "",
};

export interface DeleteServiceResponse {
  message: string;
}

export type ServiceDeletionPhase = "idle" | "confirming" | "deleting";
