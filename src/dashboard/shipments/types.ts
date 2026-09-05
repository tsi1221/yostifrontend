export type ShipmentMethod = "Air" | "Sea";

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

export type ShipmentFieldErrors = Partial<Record<keyof CreateShipmentPayload, string>>;

export const SHIPMENT_METHODS: ShipmentMethod[] = ["Air", "Sea"];

export const EMPTY_SHIPMENT_FORM: ShipmentFormValues = {
  pickupLocation: "",
  destinationCountry: "",
  city: "",
  destinationDescription: "",
  weight: "",
  volumeM3: "",
  method: "Air",
};
