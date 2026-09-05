export type TicketIssuesType = "Defect" | "Delay" | "Billing";
export type TicketResolutionValue = "replacement" | "refund";
export type TicketUrgencyValue = "low" | "medium" | "high";
export type TicketCreateStatusValue = "open";

export const TICKET_ISSUES_TYPE_VALUES: TicketIssuesType[] = [
  "Defect",
  "Delay",
  "Billing",
];

export const TICKET_RESOLUTION_VALUES: TicketResolutionValue[] = [
  "replacement",
  "refund",
];

export const TICKET_URGENCY_VALUES: TicketUrgencyValue[] = [
  "low",
  "medium",
  "high",
];

export const TICKET_ISSUES_TYPE_OPTIONS: {
  label: string;
  value: TicketIssuesType;
}[] = [
  { label: "Defect", value: "Defect" },
  { label: "Delay", value: "Delay" },
  { label: "Billing", value: "Billing" },
];

export const TICKET_RESOLUTION_OPTIONS: {
  label: string;
  value: TicketResolutionValue;
}[] = [
  { label: "Replacement", value: "replacement" },
  { label: "Refund", value: "refund" },
];

export const TICKET_URGENCY_OPTIONS: {
  label: string;
  value: TicketUrgencyValue;
  description: string;
}[] = [
  { label: "Low", value: "low", description: "Can wait for a standard review" },
  { label: "Medium", value: "medium", description: "Needs attention this week" },
  { label: "High", value: "high", description: "Blocking shipment or payment" },
];

export interface TicketRecord {
  id: number | string;
  userId: number;
  orderReference: string;
  issuesType: string;
  title: string;
  resolutionToRequest: string;
  urgency: string;
  attachment: string;
  status: string;
}

export interface CreateTicketPayload {
  orderReference: string;
  issuesType: TicketIssuesType;
  title: string;
  resolutionToRequest: TicketResolutionValue;
  urgency: TicketUrgencyValue;
  attachment: string;
  status: TicketCreateStatusValue;
}

export interface TicketFormValues {
  orderReference: string;
  issuesType: TicketIssuesType;
  title: string;
  resolutionToRequest: TicketResolutionValue;
  urgency: TicketUrgencyValue;
  attachment: string;
}

export type TicketFieldErrors = Partial<Record<keyof CreateTicketPayload, string>>;

export const EMPTY_TICKET_FORM: TicketFormValues = {
  orderReference: "",
  issuesType: "Defect",
  title: "",
  resolutionToRequest: "replacement",
  urgency: "medium",
  attachment: "",
};

export type Ticket = TicketRecord;

export type TicketIssuesTypeFilter = "Defect" | "Damage" | "missing" | "other";
export type TicketResolutionFilter = "refund" | "replacement" | "repairs";
export type TicketUrgencyFilter = "low" | "medium" | "high";
export type TicketStatusFilter = "open" | "resolved" | "close";

export const TICKET_ISSUES_TYPE_FILTERS: {
  label: string;
  value: TicketIssuesTypeFilter | "";
}[] = [
  { label: "All Issue Types", value: "" },
  { label: "Defect", value: "Defect" },
  { label: "Damage", value: "Damage" },
  { label: "missing", value: "missing" },
  { label: "other", value: "other" },
];

export const TICKET_RESOLUTION_FILTERS: {
  label: string;
  value: TicketResolutionFilter | "";
}[] = [
  { label: "All Resolutions", value: "" },
  { label: "refund", value: "refund" },
  { label: "replacement", value: "replacement" },
  { label: "repairs", value: "repairs" },
];

export const TICKET_URGENCY_FILTERS: {
  label: string;
  value: TicketUrgencyFilter | "";
}[] = [
  { label: "All Urgencies", value: "" },
  { label: "low", value: "low" },
  { label: "medium", value: "medium" },
  { label: "high", value: "high" },
];

export const TICKET_STATUS_FILTERS: {
  label: string;
  value: TicketStatusFilter | "";
}[] = [
  { label: "All Statuses", value: "" },
  { label: "open", value: "open" },
  { label: "resolved", value: "resolved" },
  { label: "close", value: "close" },
];

export interface SupportsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupportsListResponse {
  data: TicketRecord[];
  meta: SupportsListMeta;
}

export interface SupportsListQuery {
  page: number;
  pageSize: number;
  search: string;
  orderReference: string;
  issuesType: TicketIssuesTypeFilter | "";
  resolutionToRequest: TicketResolutionFilter | "";
  urgency: TicketUrgencyFilter | "";
  status: TicketStatusFilter | "";
}

export const DEFAULT_SUPPORTS_QUERY: SupportsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  orderReference: "",
  issuesType: "",
  resolutionToRequest: "",
  urgency: "",
  status: "",
};
