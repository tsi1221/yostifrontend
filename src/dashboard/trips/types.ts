export type TripStatusValue = "planned" | "ongoing" | "completed";

export const TRIP_STATUS_VALUES: TripStatusValue[] = [
  "planned",
  "ongoing",
  "completed",
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

export type TripFieldErrors = Partial<Record<keyof CreateTripPayload, string>>;

export const EMPTY_TRIP_FORM: TripFormValues = {
  arrivalCity: "",
  duration: "",
  hotel: "",
  transport: "",
  translator: "",
  status: "planned",
};
