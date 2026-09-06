export type PaymentServiceFilter = "Logistic" | "Sourcing";
export type PaymentMethodFilter = "Card" | "AliPay";
export type PaymentStatusFilter = "Pending" | "Completed" | "Refunded";

export const PAYMENT_SERVICE_FILTERS: {
  label: string;
  value: PaymentServiceFilter | "";
}[] = [
  { label: "All Services", value: "" },
  { label: "Logistic", value: "Logistic" },
  { label: "Sourcing", value: "Sourcing" },
];

export const PAYMENT_METHOD_FILTERS: {
  label: string;
  value: PaymentMethodFilter | "";
}[] = [
  { label: "All Methods", value: "" },
  { label: "Card", value: "Card" },
  { label: "AliPay", value: "AliPay" },
];

export const PAYMENT_STATUS_FILTERS: {
  label: string;
  value: PaymentStatusFilter | "";
}[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Completed", value: "Completed" },
  { label: "Refunded", value: "Refunded" },
];

export interface PaymentRecord {
  id: number;
  userId: number;
  service: string;
  method: string;
  status: string;
}

export interface PaymentsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaymentsListResponse {
  data: PaymentRecord[];
  meta: PaymentsListMeta;
}

export interface PaymentsListQuery {
  page: number;
  pageSize: number;
  search: string;
  service: PaymentServiceFilter | "";
  method: PaymentMethodFilter | "";
  status: PaymentStatusFilter | "";
}

export const DEFAULT_PAYMENTS_QUERY: PaymentsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  service: "",
  method: "",
  status: "",
};

export type PaymentServiceValue = "Logistic" | "Sourcing";
export type PaymentMethodValue = "Card" | "AliPay";
export type PaymentCreateStatusValue = "Pending";

export const PAYMENT_SERVICE_VALUES: PaymentServiceValue[] = [
  "Logistic",
  "Sourcing",
];

export const PAYMENT_METHOD_VALUES: PaymentMethodValue[] = ["Card", "AliPay"];

export const PAYMENT_SERVICE_OPTIONS: {
  label: string;
  value: PaymentServiceValue;
  description: string;
}[] = [
  { label: "Logistic", value: "Logistic", description: "Cargo and shipping charges" },
  { label: "Sourcing", value: "Sourcing", description: "Sourcing and supplier requests" },
];

export const PAYMENT_METHOD_OPTIONS: {
  label: string;
  value: PaymentMethodValue;
  description: string;
}[] = [
  { label: "Card", value: "Card", description: "Debit or credit card" },
  { label: "AliPay", value: "AliPay", description: "AliPay wallet" },
];

export interface CreatePaymentPayload {
  service: PaymentServiceValue;
  method: PaymentMethodValue;
  status: PaymentCreateStatusValue;
}

export interface PaymentFormValues {
  service: PaymentServiceValue | "";
  method: PaymentMethodValue | "";
}

export type PaymentUpdateStatusValue =
  | "Pending"
  | "Completed"
  | "Refunded"
  | "Failed";

export const PAYMENT_UPDATE_STATUS_VALUES: PaymentUpdateStatusValue[] = [
  "Pending",
  "Completed",
  "Refunded",
  "Failed",
];

export const PAYMENT_UPDATE_STATUS_OPTIONS: {
  label: string;
  value: PaymentUpdateStatusValue;
}[] = [
  { label: "Pending", value: "Pending" },
  { label: "Completed", value: "Completed" },
  { label: "Refunded", value: "Refunded" },
  { label: "Failed", value: "Failed" },
];

export interface UpdatePaymentFormValues {
  service: PaymentServiceValue;
  method: PaymentMethodValue;
  status: PaymentUpdateStatusValue;
}

export interface UpdatePaymentPayload {
  service: PaymentServiceValue;
  method: PaymentMethodValue;
  status: PaymentUpdateStatusValue;
}

export type PaymentFieldErrors = Partial<
  Record<keyof CreatePaymentPayload | keyof UpdatePaymentPayload, string>
>;

export const EMPTY_PAYMENT_FORM: PaymentFormValues = {
  service: "",
  method: "",
};

export type PaymentDeletionPhase = "idle" | "confirming" | "deleting";
