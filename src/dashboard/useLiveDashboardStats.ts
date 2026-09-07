import { useCallback, useEffect, useState } from "react";

import { expireSession } from "./auth/sessionExpiry";
import { fetchBlogsList } from "./blogs/api";
import { fetchContactsList } from "./contacts/api";
import { fetchInspectionsList } from "./inspections/inspectionsService";
import { fetchPaymentsList } from "./payments/paymentsService";
import { fetchProjectsList } from "./projects/api";
import { fetchRequestsList } from "./requests/requestsService";
import { fetchServicesList } from "./services/servicesService";
import { fetchShipmentsList } from "./shipments/shipmentsService";
import { fetchSupportsList } from "./tickets/ticketsService";
import { fetchTripsList } from "./trips/tripsService";
import { fetchUsersList } from "./users/usersService";

export interface LiveStat {
  total: number | null;
  forbidden: boolean;
}

const EMPTY: LiveStat = { total: null, forbidden: false };

async function readTotal(
  loader: () => Promise<{ total?: number; meta?: { total?: number } }>,
): Promise<LiveStat> {
  try {
    const payload = await loader();
    const total = payload.meta?.total ?? payload.total;
    return { total: typeof total === "number" ? total : 0, forbidden: false };
  } catch (cause) {
    const status =
      cause && typeof cause === "object" && "status" in cause
        ? Number((cause as { status: unknown }).status)
        : 0;
    if (status === 401) {
      expireSession();
      throw cause;
    }
    return { total: null, forbidden: status === 403 };
  }
}

export function useLiveDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LiveStat>(EMPTY);
  const [requests, setRequests] = useState<LiveStat>(EMPTY);
  const [shipments, setShipments] = useState<LiveStat>(EMPTY);
  const [payments, setPayments] = useState<LiveStat>(EMPTY);
  const [services, setServices] = useState<LiveStat>(EMPTY);
  const [supports, setSupports] = useState<LiveStat>(EMPTY);
  const [trips, setTrips] = useState<LiveStat>(EMPTY);
  const [inspections, setInspections] = useState<LiveStat>(EMPTY);
  const [blogs, setBlogs] = useState<LiveStat>(EMPTY);
  const [projects, setProjects] = useState<LiveStat>(EMPTY);
  const [contacts, setContacts] = useState<LiveStat>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    const page = { page: 1, pageSize: 1 } as const;
    const results = await Promise.allSettled([
      readTotal(() =>
        fetchUsersList({
          ...page,
          search: "",
          fullname: "",
          email: "",
          phoneWhatsapp: "",
          companyName: "",
          roleId: "",
        }),
      ),
      readTotal(() =>
        fetchRequestsList({
          page: 1,
          pageSize: 1,
          search: "",
          supplierRegion: "",
          deadline: "",
        }),
      ),
      readTotal(() =>
        fetchShipmentsList({
          page: 1,
          pageSize: 1,
          search: "",
          method: "",
          destinationCountry: "",
        }),
      ),
      readTotal(() =>
        fetchPaymentsList({
          page: 1,
          pageSize: 1,
          search: "",
          service: "",
          method: "",
          status: "",
        }),
      ),
      readTotal(() =>
        fetchServicesList({ page: 1, pageSize: 1, search: "", title: "" }),
      ),
      readTotal(() =>
        fetchSupportsList({
          page: 1,
          pageSize: 1,
          search: "",
          orderReference: "",
          issuesType: "",
          resolutionToRequest: "",
          urgency: "",
          status: "",
        }),
      ),
      readTotal(() =>
        fetchTripsList({
          page: 1,
          pageSize: 1,
          search: "",
          arrivalCity: "",
          status: "",
        }),
      ),
      readTotal(() =>
        fetchInspectionsList({
          page: 1,
          pageSize: 1,
          search: "",
          type: "",
          productType: "",
          photoVideoRequired: "",
          date: "",
        }),
      ),
      readTotal(() =>
        fetchBlogsList({ page: 1, pageSize: 1, search: "", title: "" }),
      ),
      readTotal(() =>
        fetchProjectsList({ page: 1, pageSize: 1, search: "", title: "" }),
      ),
      readTotal(() =>
        fetchContactsList({
          page: 1,
          pageSize: 1,
          search: "",
          fullname: "",
          email: "",
          topic: "",
        }),
      ),
    ]);

    const pick = (index: number): LiveStat => {
      const result = results[index];
      if (result.status === "fulfilled") {
        return result.value;
      }
      return EMPTY;
    };

    setUsers(pick(0));
    setRequests(pick(1));
    setShipments(pick(2));
    setPayments(pick(3));
    setServices(pick(4));
    setSupports(pick(5));
    setTrips(pick(6));
    setInspections(pick(7));
    setBlogs(pick(8));
    setProjects(pick(9));
    setContacts(pick(10));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    loading,
    users,
    requests,
    shipments,
    payments,
    services,
    supports,
    trips,
    inspections,
    blogs,
    projects,
    contacts,
    retry: load,
  };
}

export function formatStat(stat: LiveStat) {
  if (stat.forbidden) {
    return "—";
  }
  if (stat.total === null) {
    return "—";
  }
  return String(stat.total);
}

export function formatStatHint(
  stat: LiveStat,
  okHint: string,
  forbiddenHint = "No permission",
) {
  if (stat.forbidden) {
    return forbiddenHint;
  }
  if (stat.total === null) {
    return "Unavailable";
  }
  return okHint;
}
