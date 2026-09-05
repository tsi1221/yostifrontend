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

export type InspectionFieldErrors = Partial<
  Record<keyof CreateInspectionPayload, string>
>;

export const EMPTY_INSPECTION_FORM: InspectionFormValues = {
  supplierId: "",
  productType: "",
  type: "Preshipment",
  date: "",
  photoVideoRequired: true,
};
