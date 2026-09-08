export type TripStatusValue = "planned" | "ongoing" | "completed";

export const TRIP_STATUS_VALUES: TripStatusValue[] = [
  "planned",
  "ongoing",
  "completed",
];

export type TripStatusFilter = "planned" | "Ongoing";

export const TRIP_STATUS_FILTERS: {
  label: string;
  value: TripStatusFilter | "";
}[] = [
  { label: "All Statuses", value: "" },
  { label: "Planned", value: "planned" },
  { label: "Ongoing", value: "Ongoing" },
];

export interface TripRecord {
  id: number;
  userId: number;
  arrivalCity: string;
  duration: string;
  hotel: string;
  transport: string;
  translator: string;
  status: string;
}

export type Trip = TripRecord;

export interface CreateTripPayload {
  arrivalCity: string;
  duration: string;
  hotel: string;
  transport: string;
  translator: string;
  status: TripStatusValue;
}

export interface TripFormValues {
  arrivalCity: string;
  duration: string;
  hotel: string;
  transport: string;
  translator: string;
  status: TripStatusValue;
}

export type TripUpdateStatusValue = "planned" | "Ongoing";

export const TRIP_UPDATE_STATUS_VALUES: TripUpdateStatusValue[] = [
  "planned",
  "Ongoing",
];

export const TRIP_UPDATE_STATUS_OPTIONS: {
  label: string;
  value: TripUpdateStatusValue;
}[] = [
  { label: "Planned", value: "planned" },
  { label: "Ongoing", value: "Ongoing" },
];

export interface UpdateTripFormValues {
  arrivalCity: string;
  duration: string;
  hotel: string;
  transport: string;
  translator: string;
  status: TripUpdateStatusValue;
}

export interface UpdateTripPayload {
  arrivalCity: string;
  duration: string;
  hotel: string;
  transport: string;
  translator: string;
  status: TripUpdateStatusValue;
}

export type TripFieldErrors = Partial<
  Record<keyof CreateTripPayload | keyof UpdateTripPayload, string>
>;

export const EMPTY_TRIP_FORM: TripFormValues = {
  arrivalCity: "",
  duration: "",
  hotel: "",
  transport: "",
  translator: "",
  status: "planned",
};

export interface TripsListQuery {
  page: number;
  pageSize: number;
  search: string;
  arrivalCity: string;
  status: TripStatusFilter | "";
}

export interface TripsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TripsListResponse {
  data: TripRecord[];
  meta: TripsListMeta;
}

export const DEFAULT_TRIPS_QUERY: TripsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  arrivalCity: "",
  status: "",
};

export type TripDeletionPhase = "idle" | "confirming" | "deleting";
