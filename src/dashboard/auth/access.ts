import { fetchBlogsList } from "../blogs/api";
import { fetchContactsList } from "../contacts/api";
import { fetchInspectionsList } from "../inspections/inspectionsService";
import { fetchPaymentsList } from "../payments/paymentsService";
import { fetchPermissionsList } from "../permissions/api";
import { fetchProjectsList } from "../projects/api";
import { fetchRolesList } from "../rbac/api";
import { fetchRequestsList } from "../requests/requestsService";
import type { DashboardPageKey } from "../roles";
import { fetchServicesList } from "../services/servicesService";
import { fetchShipmentsList } from "../shipments/shipmentsService";
import { fetchSupportsList } from "../tickets/ticketsService";
import { fetchTripsList } from "../trips/tripsService";
import { fetchUsersList } from "../users/usersService";

export type AccessResource =
  | "users"
  | "payments"
  | "shipments"
  | "requests"
  | "services"
  | "supports"
  | "projects"
  | "contacts"
  | "blogs"
  | "trips"
  | "inspections"
  | "roles"
  | "permissions";

export interface ResourceAccess {
  total: number | null;
  forbidden: boolean;
  error: boolean;
}

export type AccessSnapshot = Record<AccessResource, ResourceAccess>;

const EMPTY_RESOURCE: ResourceAccess = {
  total: null,
  forbidden: false,
  error: false,
};

const PAGE_RESOURCE: Partial<Record<DashboardPageKey, AccessResource>> = {
  users: "users",
  roles: "roles",
  permissions: "permissions",
  sourcing: "requests",
  logistics: "shipments",
  "quality-control": "inspections",
  trips: "trips",
  payments: "payments",
  services: "services",
  supports: "supports",
  blogs: "blogs",
  projects: "projects",
  contacts: "contacts",
};

function readTotal(payload: { total?: number; meta?: { total?: number } }) {
  const total = payload.meta?.total ?? payload.total;
  return typeof total === "number" && Number.isFinite(total) ? total : 0;
}

function statusOf(cause: unknown) {
  if (cause && typeof cause === "object" && "status" in cause) {
    const status = Number((cause as { status: unknown }).status);
    return Number.isFinite(status) ? status : 0;
  }
  return 0;
}

async function probe(
  loader: () => Promise<{ total?: number; meta?: { total?: number } }>,
): Promise<ResourceAccess> {
  try {
    const payload = await loader();
    return { total: readTotal(payload), forbidden: false, error: false };
  } catch (cause) {
    const status = statusOf(cause);
    if (status === 401) {
      throw cause;
    }
    if (status === 403) {
      return { total: null, forbidden: true, error: false };
    }
    return { total: null, forbidden: false, error: true };
  }
}

const LIST_PAGE = { page: 1, pageSize: 1 } as const;

export function emptyAccessSnapshot(): AccessSnapshot {
  return {
    users: { ...EMPTY_RESOURCE },
    payments: { ...EMPTY_RESOURCE },
    shipments: { ...EMPTY_RESOURCE },
    requests: { ...EMPTY_RESOURCE },
    services: { ...EMPTY_RESOURCE },
    supports: { ...EMPTY_RESOURCE },
    projects: { ...EMPTY_RESOURCE },
    contacts: { ...EMPTY_RESOURCE },
    blogs: { ...EMPTY_RESOURCE },
    trips: { ...EMPTY_RESOURCE },
    inspections: { ...EMPTY_RESOURCE },
    roles: { ...EMPTY_RESOURCE },
    permissions: { ...EMPTY_RESOURCE },
  };
}

export async function probeAccessSnapshot(): Promise<AccessSnapshot> {
  const results = await Promise.allSettled([
    probe(() =>
      fetchUsersList({
        ...LIST_PAGE,
        search: "",
        fullname: "",
        email: "",
        phoneWhatsapp: "",
        companyName: "",
        roleId: "",
      }),
    ),
    probe(() =>
      fetchPaymentsList({
        ...LIST_PAGE,
        search: "",
        service: "",
        method: "",
        status: "",
      }),
    ),
    probe(() =>
      fetchShipmentsList({
        ...LIST_PAGE,
        search: "",
        method: "",
        destinationCountry: "",
      }),
    ),
    probe(() =>
      fetchRequestsList({
        ...LIST_PAGE,
        search: "",
        supplierRegion: "",
        deadline: "",
      }),
    ),
    probe(() => fetchServicesList({ ...LIST_PAGE, search: "", title: "" })),
    probe(() =>
      fetchSupportsList({
        ...LIST_PAGE,
        search: "",
        orderReference: "",
        issuesType: "",
        resolutionToRequest: "",
        urgency: "",
        status: "",
      }),
    ),
    probe(() => fetchProjectsList({ ...LIST_PAGE, search: "", title: "" })),
    probe(() =>
      fetchContactsList({
        ...LIST_PAGE,
        search: "",
        fullname: "",
        email: "",
        topic: "",
      }),
    ),
    probe(() => fetchBlogsList({ ...LIST_PAGE, search: "", title: "" })),
    probe(() =>
      fetchTripsList({
        ...LIST_PAGE,
        search: "",
        arrivalCity: "",
        status: "",
      }),
    ),
    probe(() =>
      fetchInspectionsList({
        ...LIST_PAGE,
        search: "",
        type: "",
        productType: "",
        photoVideoRequired: "",
        date: "",
      }),
    ),
    probe(() => fetchRolesList({ ...LIST_PAGE, search: "", name: "" })),
    probe(() => fetchPermissionsList({ ...LIST_PAGE, search: "" })),
  ]);

  const pick = (index: number): ResourceAccess => {
    const result = results[index];
    if (result.status === "fulfilled") {
      return result.value;
    }
    const status = statusOf(result.reason);
    if (status === 401) {
      throw result.reason;
    }
    if (status === 403) {
      return { total: null, forbidden: true, error: false };
    }
    return { total: null, forbidden: false, error: true };
  };

  return {
    users: pick(0),
    payments: pick(1),
    shipments: pick(2),
    requests: pick(3),
    services: pick(4),
    supports: pick(5),
    projects: pick(6),
    contacts: pick(7),
    blogs: pick(8),
    trips: pick(9),
    inspections: pick(10),
    roles: pick(11),
    permissions: pick(12),
  };
}

export function canOpenPage(
  page: DashboardPageKey,
  access: AccessSnapshot | null,
) {
  const resource = PAGE_RESOURCE[page];
  if (!resource) {
    return true;
  }
  if (!access) {
    return false;
  }
  return !access[resource].forbidden;
}

export function resourceForPage(page: DashboardPageKey) {
  return PAGE_RESOURCE[page];
}
