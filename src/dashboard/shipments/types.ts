export type ShipmentMethod = "Air" | "Sea";
export type ShipmentMethodValue = "sea" | "Air" | "Express";

export const SHIPMENT_METHOD_VALUES: ShipmentMethodValue[] = ["sea", "Air", "Express"];

export const SHIPMENT_METHOD_OPTIONS: {
  label: string;
  value: ShipmentMethodValue;
}[] = [
  { label: "Sea", value: "sea" },
  { label: "Air", value: "Air" },
  { label: "Express", value: "Express" },
];

export interface ShipmentRecord {
  id: number;
  userId: number;
  pickupLocation: string;
  destinationCountry: string;
  city: string;
  destinationDescription: string;
  weight: string;
  volumeM3: number;
  method: string;
}

export interface CreateShipmentPayload {
  pickupLocation: string;
  destinationCountry: string;
  city: string;
  destinationDescription: string;
  weight: string;
  volumeM3: string;
  method: ShipmentMethod;
}

export interface ShipmentFormValues {
  pickupLocation: string;
  destinationCountry: string;
  city: string;
  destinationDescription: string;
  weight: string;
  volumeM3: string;
  method: ShipmentMethod;
}

export interface UpdateShipmentFormValues {
  pickupLocation: string;
  destinationCountry: string;
  city: string;
  destinationDescription: string;
  weight: string;
  volumeM3: string;
  method: ShipmentMethodValue;
}

export type UpdateShipmentPayload = UpdateShipmentFormValues;

export type ShipmentFieldErrors = Partial<Record<keyof UpdateShipmentPayload, string>>;

export const SHIPMENT_METHODS: ShipmentMethod[] = ["Air", "Sea"];

export type ShipmentMethodFilter = "sea" | "Air" | "Express";

export const SHIPMENT_METHOD_FILTERS: {
  label: string;
  value: ShipmentMethodFilter | "";
}[] = [
  { label: "All Methods", value: "" },
  { label: "Sea", value: "sea" },
  { label: "Air", value: "Air" },
  { label: "Express", value: "Express" },
];

export interface ShipmentsListQuery {
  page: number;
  pageSize: number;
  search: string;
  method: ShipmentMethodFilter | "";
  destinationCountry: string;
}

export interface ShipmentsListResponse {
  data: ShipmentRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_SHIPMENTS_QUERY: ShipmentsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  method: "",
  destinationCountry: "",
};

export type ShipmentDeletionPhase = "idle" | "confirming" | "deleting";

export const EMPTY_SHIPMENT_FORM: ShipmentFormValues = {
  pickupLocation: "",
  destinationCountry: "",
  city: "",
  destinationDescription: "",
  weight: "",
  volumeM3: "",
  method: "Air",
};
