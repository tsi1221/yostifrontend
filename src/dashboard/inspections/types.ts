export type InspectionTypeValue = "Preshipment" | "In-production";

export const INSPECTION_TYPE_VALUES: InspectionTypeValue[] = [
  "Preshipment",
  "In-production",
];

export interface InspectionRecord {
  id: number;
  userId: number;
  supplierId: number;
  productType: string;
  type: string;
  date: string;
  photoVideoRequired: boolean;
}

export interface CreateInspectionPayload {
  supplierId: number;
  productType: string;
  type: InspectionTypeValue;
  date: string;
  photoVideoRequired: boolean;
}

export interface InspectionFormValues {
  supplierId: string;
  productType: string;
  type: InspectionTypeValue;
  date: string;
  photoVideoRequired: boolean;
}

export type InspectionUpdateTypeValue = "Preshipment" | "factory visit";

export const INSPECTION_UPDATE_TYPE_VALUES: InspectionUpdateTypeValue[] = [
  "Preshipment",
  "factory visit",
];

export const INSPECTION_UPDATE_TYPE_OPTIONS: {
  label: string;
  value: InspectionUpdateTypeValue;
}[] = [
  { label: "Preshipment", value: "Preshipment" },
  { label: "Factory Visit", value: "factory visit" },
];

export interface UpdateInspectionFormValues {
  supplierId: string;
  productType: string;
  type: InspectionUpdateTypeValue;
  date: string;
  photoVideoRequired: boolean;
}

export interface UpdateInspectionPayload {
  supplierId: number;
  productType: string;
  type: InspectionUpdateTypeValue;
  date: string;
  photoVideoRequired: boolean;
}

export type InspectionFieldErrors = Partial<
  Record<keyof CreateInspectionPayload | keyof UpdateInspectionPayload, string>
>;

export const EMPTY_INSPECTION_FORM: InspectionFormValues = {
  supplierId: "",
  productType: "",
  type: "Preshipment",
  date: "",
  photoVideoRequired: true,
};

export type InspectionTypeFilter = "Preshipment" | "factory visit";

export const INSPECTION_TYPE_FILTERS: {
  label: string;
  value: InspectionTypeFilter | "";
}[] = [
  { label: "All Types", value: "" },
  { label: "Preshipment", value: "Preshipment" },
  { label: "Factory Visit", value: "factory visit" },
];

export type InspectionMediaFilter = "" | "true" | "false";

export const INSPECTION_MEDIA_FILTERS: {
  label: string;
  value: InspectionMediaFilter;
}[] = [
  { label: "All media", value: "" },
  { label: "Photo / video required", value: "true" },
  { label: "Standard verification", value: "false" },
];

export interface InspectionsListQuery {
  page: number;
  pageSize: number;
  search: string;
  type: InspectionTypeFilter | "";
  productType: string;
  photoVideoRequired: InspectionMediaFilter;
  date: string;
}

export interface InspectionsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InspectionsListResponse {
  data: InspectionRecord[];
  meta: InspectionsListMeta;
}

export const DEFAULT_INSPECTIONS_QUERY: InspectionsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  type: "",
  productType: "",
  photoVideoRequired: "",
  date: "",
};

export type InspectionDeletionPhase = "idle" | "confirming" | "deleting";
