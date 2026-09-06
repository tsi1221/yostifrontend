export type UserRole =
  | "SUPER_ADMIN"
  | "STAFF"
  | "BUYER"
  | "SUPPLIER"
  | "LOGISTICS_PARTNER";

export type AccountType = "individual" | "business" | "supplier" | "logistics";
export type SupplierRegion = "Yiwu" | "Guangzhou" | "Shenzhen";
export type SourcingStatus = "open" | "quoted" | "completed";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type ShippingMethod = "sea" | "air" | "express";
export type ShipmentStatus =
  | "booked"
  | "in transit"
  | "at port"
  | "customs"
  | "delivered";
export type DestinationCountry = "Ethiopia" | "China" | "Uganda" | "South Sudan";
export type InspectionType = "sample" | "pre-shipment" | "factory visit";
export type InspectionStatus = "pending" | "scheduled" | "in progress" | "completed";
export type VisaStatus = "pending" | "approved" | "rejected";
export type ServiceType = "sourcing" | "logistics" | "inspection" | "trip" | "visa";
export type PaymentMethod = "bank transfer" | "card" | "Alipay" | "WeChat Pay";
export type PaymentStatus = "pending" | "completed" | "failed";
export type IssueType = "defect" | "damage" | "missing";
export type Urgency = "low" | "medium" | "high";
export type SupportStatus = "open" | "resolved" | "closed";

export interface UserAccount {
  id: string;
  full_name: string;
  company_name: string;
  country: string;
  phone: string;
  email: string;
  account_type: AccountType;
  language_preference: string;
  role: UserRole;
  active: boolean;
}

export interface SupplierFactory {
  supplier_id: string;
  name: string;
  contact_person: string;
  verified: boolean;
  location_city: string;
  location_province: string;
  account_id: string;
}

export interface SupplierVerification {
  verification_id: string;
  supplier_id: string;
  status: VerificationStatus;
  turnaround_time: string;
  concerns: string;
}

export interface SourcingRequest {
  request_id: string;
  product_name: string;
  description: string;
  quantity: number;
  target_price: number;
  supplier_region: SupplierRegion;
  deadline: string;
  status: SourcingStatus;
  buyer_id: string;
  assigned_supplier_ids: string[];
}

export interface SupplierQuote {
  quote_id: string;
  request_id: string;
  supplier_id: string;
  price: number;
  moq: number;
  lead_time: string;
  notes: string;
}

export interface Shipment {
  shipment_id: string;
  tracking_number: string;
  pickup_location: string;
  destination_country: DestinationCountry;
  goods_description: string;
  weight: number;
  volume: number;
  shipping_method: ShippingMethod;
  status: ShipmentStatus;
  estimated_delivery_date: string;
  buyer_id: string;
  supplier_id: string;
  logistics_id: string;
  documents: string[];
}

export interface QualityInspection {
  inspection_id: string;
  product_type: string;
  inspection_type: InspectionType;
  photo_video_required: boolean;
  report_url: string;
  status: InspectionStatus;
  buyer_id: string;
  supplier_id: string;
  scheduled_date: string;
}

export interface BusinessTrip {
  trip_id: string;
  arrival_city: string;
  duration_days: number;
  passport_number: string;
  nationality: string;
  visa_status: VisaStatus;
  hotel_booking: boolean;
  translator: boolean;
  buyer_id: string;
}

export interface Payment {
  payment_id: string;
  service_type: ServiceType;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  buyer_id: string;
  order_reference: string;
}

export interface SupportRequest {
  support_id: string;
  order_reference: string;
  issue_type: IssueType;
  urgency: Urgency;
  status: SupportStatus;
  user_id: string;
  notes: string;
}

export interface CountryProductList {
  country_name: string;
  iso_code: string;
  export_categories: string[];
  export_products: string[];
}

export interface ActivityLog {
  log_id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
}

export interface DashboardSnapshot {
  users: UserAccount[];
  suppliers: SupplierFactory[];
  verifications: SupplierVerification[];
  sourcing_requests: SourcingRequest[];
  quotes: SupplierQuote[];
  shipments: Shipment[];
  inspections: QualityInspection[];
  trips: BusinessTrip[];
  payments: Payment[];
  support_requests: SupportRequest[];
  country_products: CountryProductList[];
  activity: ActivityLog[];
}
