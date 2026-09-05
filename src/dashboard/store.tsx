import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

/* eslint-disable react-refresh/only-export-components -- session store exports selectors with the provider */

import { initialSnapshot } from "./mocks/data";
import type {
  AccountType,
  DashboardSnapshot,
  InspectionStatus,
  InspectionType,
  PaymentMethod,
  ShipmentStatus,
  SourcingRequest,
  SupplierFactory,
  SupplierRegion,
  SupportStatus,
  UserAccount,
  UserRole,
  VerificationStatus,
  VisaStatus,
} from "./types";

export const SESSION_USERS: Record<UserRole, string> = {
  SUPER_ADMIN: "u-admin",
  STAFF: "u-staff",
  BUYER: "u-buyer-1",
  SUPPLIER: "u-supplier-1",
  LOGISTICS_PARTNER: "u-logistics-1",
};

export const SHIPMENT_PIPELINE: ShipmentStatus[] = [
  "booked",
  "in transit",
  "at port",
  "customs",
  "delivered",
];

const cloneSnapshot = (): DashboardSnapshot => structuredClone(initialSnapshot);

const stamp = () => new Date().toISOString();

const nextId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const log = (
  snapshot: DashboardSnapshot,
  actor_id: string,
  action: string,
  entity: string,
  entity_id: string
): DashboardSnapshot => ({
  ...snapshot,
  activity: [
    {
      log_id: nextId("log"),
      actor_id,
      action,
      entity,
      entity_id,
      created_at: stamp(),
    },
    ...snapshot.activity,
  ],
});

interface SourcingInput {
  product_name: string;
  description: string;
  quantity: number;
  target_price: number;
  supplier_region: SupplierRegion;
  deadline: string;
}

interface QuoteInput {
  request_id: string;
  supplier_id: string;
  price: number;
  moq: number;
  lead_time: string;
  notes: string;
}

interface InspectionInput {
  product_type: string;
  inspection_type: InspectionType;
  photo_video_required: boolean;
  supplier_id: string;
  scheduled_date: string;
}

interface TripInput {
  arrival_city: string;
  duration_days: number;
  passport_number: string;
  nationality: string;
  hotel_booking: boolean;
  translator: boolean;
}

type Action =
  | { type: "SUBMIT_SOURCING"; actorId: string; input: SourcingInput }
  | { type: "SUBMIT_QUOTE"; actorId: string; input: QuoteInput }
  | { type: "REQUEST_INSPECTION"; actorId: string; input: InspectionInput }
  | { type: "SUBMIT_TRIP"; actorId: string; input: TripInput }
  | {
      type: "PAY_INVOICE";
      actorId: string;
      paymentId: string;
      method: PaymentMethod;
    }
  | {
      type: "UPDATE_VERIFICATION";
      actorId: string;
      verificationId: string;
      status: VerificationStatus;
      concerns?: string;
    }
  | {
      type: "UPDATE_SUPPLIER_PROFILE";
      actorId: string;
      supplierId: string;
      patch: Partial<
        Pick<
          SupplierFactory,
          "name" | "contact_person" | "location_city" | "location_province"
        >
      >;
    }
  | {
      type: "ASSIGN_SOURCING";
      actorId: string;
      requestId: string;
      supplierIds: string[];
    }
  | {
      type: "UPDATE_SHIPMENT_STATUS";
      actorId: string;
      shipmentId: string;
      status: ShipmentStatus;
    }
  | {
      type: "UPLOAD_SHIPMENT_DOC";
      actorId: string;
      shipmentId: string;
      document: string;
    }
  | {
      type: "UPDATE_TRIP_VISA";
      actorId: string;
      tripId: string;
      visaStatus: VisaStatus;
    }
  | {
      type: "UPDATE_INSPECTION";
      actorId: string;
      inspectionId: string;
      status: InspectionStatus;
      reportUrl?: string;
    }
  | {
      type: "CLOSE_SUPPORT";
      actorId: string;
      supportId: string;
      status: SupportStatus;
    }
  | { type: "TOGGLE_USER_ACTIVE"; actorId: string; userId: string }
  | {
      type: "ASSIGN_USER_ROLE";
      actorId: string;
      userId: string;
      role: UserRole;
    }
  | { type: "UPSERT_USER"; actorId: string; user: UserAccount }
  | { type: "DELETE_USER"; actorId: string; userId: string };

function reducer(state: DashboardSnapshot, action: Action): DashboardSnapshot {
  switch (action.type) {
    case "SUBMIT_SOURCING": {
      const request: SourcingRequest = {
        request_id: nextId("REQ"),
        ...action.input,
        status: "open",
        buyer_id: action.actorId,
        assigned_supplier_ids: [],
      };
      return log(
        { ...state, sourcing_requests: [request, ...state.sourcing_requests] },
        action.actorId,
        `Submitted sourcing request ${request.request_id}`,
        "sourcing_requests",
        request.request_id
      );
    }
    case "SUBMIT_QUOTE": {
      const quote = {
        quote_id: nextId("Q"),
        ...action.input,
      };
      return log(
        {
          ...state,
          quotes: [quote, ...state.quotes],
          sourcing_requests: state.sourcing_requests.map((row) =>
            row.request_id === action.input.request_id
              ? { ...row, status: "quoted" as const }
              : row
          ),
        },
        action.actorId,
        `Submitted quote ${quote.quote_id} on ${quote.request_id}`,
        "quotes",
        quote.quote_id
      );
    }
    case "REQUEST_INSPECTION": {
      const inspection = {
        inspection_id: nextId("INS"),
        ...action.input,
        report_url: "",
        status: "pending" as const,
        buyer_id: action.actorId,
      };
      return log(
        { ...state, inspections: [inspection, ...state.inspections] },
        action.actorId,
        `Requested ${inspection.inspection_type} inspection for ${inspection.product_type}`,
        "inspections",
        inspection.inspection_id
      );
    }
    case "SUBMIT_TRIP": {
      const trip = {
        trip_id: nextId("TR"),
        ...action.input,
        visa_status: "pending" as const,
        buyer_id: action.actorId,
      };
      return log(
        { ...state, trips: [trip, ...state.trips] },
        action.actorId,
        `Submitted visa / business trip ${trip.trip_id} to ${trip.arrival_city}`,
        "trips",
        trip.trip_id
      );
    }
    case "PAY_INVOICE": {
      return log(
        {
          ...state,
          payments: state.payments.map((row) =>
            row.payment_id === action.paymentId
              ? {
                  ...row,
                  status: "completed",
                  payment_method: action.method,
                }
              : row
          ),
        },
        action.actorId,
        `Paid invoice ${action.paymentId}`,
        "payments",
        action.paymentId
      );
    }
    case "UPDATE_VERIFICATION": {
      const verification = state.verifications.find(
        (row) => row.verification_id === action.verificationId
      );
      return log(
        {
          ...state,
          verifications: state.verifications.map((row) =>
            row.verification_id === action.verificationId
              ? {
                  ...row,
                  status: action.status,
                  concerns: action.concerns ?? row.concerns,
                  turnaround_time:
                    action.status === "pending" ? row.turnaround_time : "Same day",
                }
              : row
          ),
          suppliers: state.suppliers.map((row) =>
            row.supplier_id === verification?.supplier_id
              ? { ...row, verified: action.status === "approved" }
              : row
          ),
        },
        action.actorId,
        `${action.status === "approved" ? "Approved" : "Rejected"} supplier verification ${action.verificationId}`,
        "verifications",
        action.verificationId
      );
    }
    case "UPDATE_SUPPLIER_PROFILE": {
      return log(
        {
          ...state,
          suppliers: state.suppliers.map((row) =>
            row.supplier_id === action.supplierId
              ? { ...row, ...action.patch }
              : row
          ),
        },
        action.actorId,
        `Updated company profile ${action.supplierId}`,
        "suppliers",
        action.supplierId
      );
    }
    case "ASSIGN_SOURCING": {
      return log(
        {
          ...state,
          sourcing_requests: state.sourcing_requests.map((row) =>
            row.request_id === action.requestId
              ? { ...row, assigned_supplier_ids: action.supplierIds }
              : row
          ),
        },
        action.actorId,
        `Assigned ${action.requestId} to ${action.supplierIds.join(", ") || "no factories"}`,
        "sourcing_requests",
        action.requestId
      );
    }
    case "UPDATE_SHIPMENT_STATUS": {
      return log(
        {
          ...state,
          shipments: state.shipments.map((row) =>
            row.shipment_id === action.shipmentId
              ? { ...row, status: action.status }
              : row
          ),
        },
        action.actorId,
        `Updated cargo ${action.shipmentId} to ${action.status}`,
        "shipments",
        action.shipmentId
      );
    }
    case "UPLOAD_SHIPMENT_DOC": {
      return log(
        {
          ...state,
          shipments: state.shipments.map((row) =>
            row.shipment_id === action.shipmentId
              ? {
                  ...row,
                  documents: row.documents.includes(action.document)
                    ? row.documents
                    : [...row.documents, action.document],
                }
              : row
          ),
        },
        action.actorId,
        `Uploaded ${action.document} for ${action.shipmentId}`,
        "shipments",
        action.shipmentId
      );
    }
    case "UPDATE_TRIP_VISA": {
      return log(
        {
          ...state,
          trips: state.trips.map((row) =>
            row.trip_id === action.tripId
              ? { ...row, visa_status: action.visaStatus }
              : row
          ),
        },
        action.actorId,
        `Set visa status on ${action.tripId} to ${action.visaStatus}`,
        "trips",
        action.tripId
      );
    }
    case "UPDATE_INSPECTION": {
      return log(
        {
          ...state,
          inspections: state.inspections.map((row) =>
            row.inspection_id === action.inspectionId
              ? {
                  ...row,
                  status: action.status,
                  report_url: action.reportUrl ?? row.report_url,
                }
              : row
          ),
        },
        action.actorId,
        `Updated inspection ${action.inspectionId} to ${action.status}`,
        "inspections",
        action.inspectionId
      );
    }
    case "CLOSE_SUPPORT": {
      return log(
        {
          ...state,
          support_requests: state.support_requests.map((row) =>
            row.support_id === action.supportId
              ? { ...row, status: action.status }
              : row
          ),
        },
        action.actorId,
        `Marked support ${action.supportId} as ${action.status}`,
        "support_requests",
        action.supportId
      );
    }
    case "TOGGLE_USER_ACTIVE": {
      const user = state.users.find((row) => row.id === action.userId);
      return log(
        {
          ...state,
          users: state.users.map((row) =>
            row.id === action.userId ? { ...row, active: !row.active } : row
          ),
        },
        action.actorId,
        `${user?.active ? "Disabled" : "Enabled"} account ${action.userId}`,
        "users",
        action.userId
      );
    }
    case "ASSIGN_USER_ROLE": {
      const accountType: AccountType =
        action.role === "SUPPLIER"
          ? "supplier"
          : action.role === "LOGISTICS_PARTNER"
            ? "logistics"
            : action.role === "BUYER"
              ? "business"
              : "business";
      return log(
        {
          ...state,
          users: state.users.map((row) =>
            row.id === action.userId
              ? { ...row, role: action.role, account_type: accountType }
              : row
          ),
        },
        action.actorId,
        `Assigned role ${action.role} to ${action.userId}`,
        "users",
        action.userId
      );
    }
    case "UPSERT_USER": {
      const exists = state.users.some((row) => row.id === action.user.id);
      return log(
        {
          ...state,
          users: exists
            ? state.users.map((row) =>
                row.id === action.user.id ? action.user : row
              )
            : [action.user, ...state.users],
        },
        action.actorId,
        `${exists ? "Updated" : "Created"} user ${action.user.full_name}`,
        "users",
        action.user.id
      );
    }
    case "DELETE_USER": {
      return log(
        {
          ...state,
          users: state.users.filter((row) => row.id !== action.userId),
        },
        action.actorId,
        `Removed user ${action.userId}`,
        "users",
        action.userId
      );
    }
    default:
      return state;
  }
}

export interface DashboardActions {
  submitSourcing: (input: SourcingInput) => void;
  submitQuote: (input: QuoteInput) => void;
  requestInspection: (input: InspectionInput) => void;
  submitTrip: (input: TripInput) => void;
  payInvoice: (paymentId: string, method: PaymentMethod) => void;
  updateVerification: (
    verificationId: string,
    status: VerificationStatus,
    concerns?: string
  ) => void;
  updateSupplierProfile: (
    supplierId: string,
    patch: Partial<
      Pick<
        SupplierFactory,
        "name" | "contact_person" | "location_city" | "location_province"
      >
    >
  ) => void;
  assignSourcing: (requestId: string, supplierIds: string[]) => void;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;
  uploadShipmentDoc: (shipmentId: string, document: string) => void;
  updateTripVisa: (tripId: string, visaStatus: VisaStatus) => void;
  updateInspection: (
    inspectionId: string,
    status: InspectionStatus,
    reportUrl?: string
  ) => void;
  closeSupport: (supportId: string, status: SupportStatus) => void;
  toggleUserActive: (userId: string) => void;
  assignUserRole: (userId: string, role: UserRole) => void;
  upsertUser: (user: UserAccount) => void;
  deleteUser: (userId: string) => void;
}

interface DashboardContextValue {
  snapshot: DashboardSnapshot;
  role: UserRole;
  user: UserAccount;
  actions: DashboardActions;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const [snapshot, dispatch] = useReducer(reducer, undefined, cloneSnapshot);
  const user =
    snapshot.users.find((item) => item.id === SESSION_USERS[role]) ??
    snapshot.users[0];

  const actor = user.id;

  const actions = useMemo<DashboardActions>(
    () => ({
      submitSourcing: (input) =>
        dispatch({ type: "SUBMIT_SOURCING", actorId: actor, input }),
      submitQuote: (input) =>
        dispatch({ type: "SUBMIT_QUOTE", actorId: actor, input }),
      requestInspection: (input) =>
        dispatch({ type: "REQUEST_INSPECTION", actorId: actor, input }),
      submitTrip: (input) =>
        dispatch({ type: "SUBMIT_TRIP", actorId: actor, input }),
      payInvoice: (paymentId, method) =>
        dispatch({ type: "PAY_INVOICE", actorId: actor, paymentId, method }),
      updateVerification: (verificationId, status, concerns) =>
        dispatch({
          type: "UPDATE_VERIFICATION",
          actorId: actor,
          verificationId,
          status,
          concerns,
        }),
      updateSupplierProfile: (supplierId, patch) =>
        dispatch({
          type: "UPDATE_SUPPLIER_PROFILE",
          actorId: actor,
          supplierId,
          patch,
        }),
      assignSourcing: (requestId, supplierIds) =>
        dispatch({
          type: "ASSIGN_SOURCING",
          actorId: actor,
          requestId,
          supplierIds,
        }),
      updateShipmentStatus: (shipmentId, status) =>
        dispatch({
          type: "UPDATE_SHIPMENT_STATUS",
          actorId: actor,
          shipmentId,
          status,
        }),
      uploadShipmentDoc: (shipmentId, document) =>
        dispatch({
          type: "UPLOAD_SHIPMENT_DOC",
          actorId: actor,
          shipmentId,
          document,
        }),
      updateTripVisa: (tripId, visaStatus) =>
        dispatch({
          type: "UPDATE_TRIP_VISA",
          actorId: actor,
          tripId,
          visaStatus,
        }),
      updateInspection: (inspectionId, status, reportUrl) =>
        dispatch({
          type: "UPDATE_INSPECTION",
          actorId: actor,
          inspectionId,
          status,
          reportUrl,
        }),
      closeSupport: (supportId, status) =>
        dispatch({ type: "CLOSE_SUPPORT", actorId: actor, supportId, status }),
      toggleUserActive: (userId) =>
        dispatch({ type: "TOGGLE_USER_ACTIVE", actorId: actor, userId }),
      assignUserRole: (userId, nextRole) =>
        dispatch({
          type: "ASSIGN_USER_ROLE",
          actorId: actor,
          userId,
          role: nextRole,
        }),
      upsertUser: (nextUser) =>
        dispatch({ type: "UPSERT_USER", actorId: actor, user: nextUser }),
      deleteUser: (userId) =>
        dispatch({ type: "DELETE_USER", actorId: actor, userId }),
    }),
    [actor]
  );

  const value = useMemo(
    () => ({ snapshot, role, user, actions }),
    [snapshot, role, user, actions]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
}

export function useOptionalDashboard() {
  return useContext(DashboardContext);
}

export const findUserName = (snapshot: DashboardSnapshot, id: string) =>
  snapshot.users.find((user) => user.id === id)?.full_name ?? id;

export const findSupplierName = (snapshot: DashboardSnapshot, id: string) =>
  snapshot.suppliers.find((row) => row.supplier_id === id)?.name ?? id;

export const supplierForAccount = (
  snapshot: DashboardSnapshot,
  accountId: string
) => snapshot.suppliers.find((row) => row.account_id === accountId);

export function getSourcingRequests(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.sourcing_requests;
  }

  if (role === "BUYER") {
    return snapshot.sourcing_requests.filter((row) => row.buyer_id === userId);
  }

  if (role === "SUPPLIER") {
    const supplier = supplierForAccount(snapshot, userId);
    if (!supplier) {
      return snapshot.sourcing_requests.filter((row) => row.status === "open");
    }
    return snapshot.sourcing_requests.filter(
      (row) =>
        row.status !== "completed" &&
        (row.assigned_supplier_ids.length === 0 ||
          row.assigned_supplier_ids.includes(supplier.supplier_id))
    );
  }

  return [];
}

export function getQuotes(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.quotes;
  }

  if (role === "SUPPLIER") {
    const supplier = supplierForAccount(snapshot, userId);
    return snapshot.quotes.filter(
      (row) => row.supplier_id === supplier?.supplier_id
    );
  }

  if (role === "BUYER") {
    const requestIds = snapshot.sourcing_requests
      .filter((row) => row.buyer_id === userId)
      .map((row) => row.request_id);
    return snapshot.quotes.filter((row) => requestIds.includes(row.request_id));
  }

  return [];
}

export function getShipments(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.shipments;
  }
  if (role === "BUYER") {
    return snapshot.shipments.filter((row) => row.buyer_id === userId);
  }
  if (role === "SUPPLIER") {
    const supplier = supplierForAccount(snapshot, userId);
    return snapshot.shipments.filter(
      (row) => row.supplier_id === supplier?.supplier_id
    );
  }
  if (role === "LOGISTICS_PARTNER") {
    return snapshot.shipments.filter((row) => row.logistics_id === userId);
  }
  return [];
}

export function getInspections(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.inspections;
  }
  if (role === "BUYER") {
    return snapshot.inspections.filter((row) => row.buyer_id === userId);
  }
  if (role === "SUPPLIER") {
    const supplier = supplierForAccount(snapshot, userId);
    return snapshot.inspections.filter(
      (row) => row.supplier_id === supplier?.supplier_id
    );
  }
  return [];
}

export function getTrips(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.trips;
  }
  if (role === "BUYER") {
    return snapshot.trips.filter((row) => row.buyer_id === userId);
  }
  return [];
}

export function getPayments(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.payments;
  }
  if (role === "BUYER") {
    return snapshot.payments.filter((row) => row.buyer_id === userId);
  }
  return [];
}

export function getSupportRequests(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.support_requests;
  }
  return snapshot.support_requests.filter((row) => row.user_id === userId);
}

export function getActivity(
  snapshot: DashboardSnapshot,
  role: UserRole,
  userId: string
) {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return snapshot.activity;
  }
  return snapshot.activity.filter((row) => row.actor_id === userId);
}

export function useScopedRecords() {
  const { snapshot, role, user } = useDashboard();
  return {
    snapshot,
    role,
    user,
    sourcing: getSourcingRequests(snapshot, role, user.id),
    quotes: getQuotes(snapshot, role, user.id),
    shipments: getShipments(snapshot, role, user.id),
    inspections: getInspections(snapshot, role, user.id),
    trips: getTrips(snapshot, role, user.id),
    payments: getPayments(snapshot, role, user.id),
    support: getSupportRequests(snapshot, role, user.id),
    activity: getActivity(snapshot, role, user.id),
    supplier: supplierForAccount(snapshot, user.id),
  };
}
