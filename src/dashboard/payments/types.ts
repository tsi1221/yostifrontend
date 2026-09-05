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
