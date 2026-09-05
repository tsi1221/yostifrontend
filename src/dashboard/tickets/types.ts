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
