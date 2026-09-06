export interface ContactRecord {
  id: number;
  fullname: string;
  phoneWhatsapp: string;
  email: string;
  topic: string;
  details: string;
}

export interface CreateContactPayload {
  fullname: string;
  phoneWhatsapp: string;
  email: string;
  topic: string;
  details: string;
}

export interface UpdateContactPayload {
  fullname?: string;
  phoneWhatsapp?: string;
  email?: string;
  topic?: string;
  details?: string;
}

export interface ContactFormValues {
  fullname: string;
  phoneWhatsapp: string;
  email: string;
  topic: string;
  details: string;
}

export type ContactFieldErrors = Partial<
  Record<"fullname" | "phoneWhatsapp" | "email" | "topic" | "details", string>
>;

export const CONTACT_TOPIC_VALUES = [
  "Sourcing",
  "Logistics",
  "Quality",
  "Partnership",
  "Other",
] as const;

export type ContactTopicValue = (typeof CONTACT_TOPIC_VALUES)[number];

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  fullname: "",
  phoneWhatsapp: "",
  email: "",
  topic: "",
  details: "",
};

export interface CreateContactResult {
  record: ContactRecord;
  message: string;
}

export interface ContactsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ContactsListResponse {
  data: ContactRecord[];
  meta: ContactsListMeta;
}

export interface ContactsListQuery {
  page: number;
  pageSize: number;
  search: string;
  fullname: string;
  email: string;
  topic: string;
}

export const DEFAULT_CONTACTS_QUERY: ContactsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  fullname: "",
  email: "",
  topic: "",
};

export interface DeleteContactResponse {
  message: string;
}

export type ContactDeletionPhase = "idle" | "confirming" | "deleting";
