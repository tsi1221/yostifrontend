export type UserRole =
  | "SUPER_ADMIN"
  | "STAFF"
  | "BUYER"
  | "SUPPLIER"
  | "LOGISTICS_PARTNER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";
export type ShipmentStatus =
  | "PENDING"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "CUSTOMS"
  | "DELIVERED"
  | "DELAYED"
  | "CANCELLED";
export type ShipmentMode = "SEA" | "AIR" | "ROAD";
export type RfqStatus = "OPEN" | "QUOTED" | "AWARDED" | "COMPLETED";
export type QuoteStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";
export type InspectionStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "PASSED"
  | "FAILED"
  | "COMPLETED";
export type InspectionPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type VisaStatus = "DRAFT" | "SUBMITTED" | "ISSUED" | "REJECTED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type ContentStatus = "DRAFT" | "PUBLISHED";
export type ContactStatus = "NEW" | "REVIEWED" | "CLOSED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  country: string;
  role: UserRole;
  status: UserStatus;
  languagePreference: string;
  createdAt: string;
}

export interface SourcingRequest {
  id: string;
  reference: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  targetPrice: number;
  currency: string;
  region: string;
  buyerId: string;
  status: RfqStatus;
  deadline: string;
  sampleRequired: boolean;
  createdAt: string;
}

export interface SupplierQuote {
  id: string;
  requestId: string;
  supplierId: string;
  unitPrice: number;
  currency: string;
  leadDays: number;
  notes: string;
  status: QuoteStatus;
  createdAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  requestId: string;
  buyerId: string;
  supplierId: string;
  logisticsPartnerId: string;
  title: string;
  origin: string;
  destination: string;
  mode: ShipmentMode;
  status: ShipmentStatus;
  weightKg: number;
  volumeCbm: number;
  eta: string;
  createdAt: string;
}

export interface Inspection {
  id: string;
  requestNumber: string;
  requestId: string;
  shipmentId?: string;
  productName: string;
  supplierId: string;
  buyerId: string;
  inspectorName: string;
  location: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  scheduledDate: string;
  result?: string;
}

export interface Trip {
  id: string;
  title: string;
  buyerId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  purpose: string;
}

export interface VisaInvitation {
  id: string;
  buyerId: string;
  fullName: string;
  passportNo: string;
  nationality: string;
  purpose: string;
  status: VisaStatus;
  issuedAt?: string;
}

export interface Payment {
  id: string;
  reference: string;
  buyerId: string;
  shipmentId?: string;
  requestId?: string;
  amount: number;
  currency: string;
  method: "BANK_TRANSFER" | "LETTER_OF_CREDIT" | "ESCROW";
  status: PaymentStatus;
  paidAt?: string;
}

export interface TradeService {
  id: string;
  name: string;
  description: string;
  feeUsd: number;
  active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  status: ContactStatus;
  createdAt: string;
}

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  sizeKb: number;
  uploadedBy: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  status: ContentStatus;
  publishedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  country: string;
  status: ContentStatus;
  year: number;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}

export interface DashboardSnapshot {
  users: User[];
  sourcingRequests: SourcingRequest[];
  quotes: SupplierQuote[];
  shipments: Shipment[];
  inspections: Inspection[];
  trips: Trip[];
  visas: VisaInvitation[];
  payments: Payment[];
  services: TradeService[];
  contacts: ContactMessage[];
  files: StoredFile[];
  tickets: SupportTicket[];
  blogs: BlogPost[];
  projects: Project[];
  activity: ActivityLog[];
}
