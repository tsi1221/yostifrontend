import { useAuth } from "./auth/AuthProvider";
import type { ResourceAccess } from "./auth/access";

export type LiveStat = ResourceAccess;

export function useLiveDashboardStats() {
  const { access, ready, refreshAccess } = useAuth();
  const loading = !ready || !access;
  const empty: LiveStat = { total: null, forbidden: false, error: false };

  return {
    loading,
    users: access?.users ?? empty,
    requests: access?.requests ?? empty,
    shipments: access?.shipments ?? empty,
    payments: access?.payments ?? empty,
    services: access?.services ?? empty,
    supports: access?.supports ?? empty,
    trips: access?.trips ?? empty,
    inspections: access?.inspections ?? empty,
    blogs: access?.blogs ?? empty,
    projects: access?.projects ?? empty,
    contacts: access?.contacts ?? empty,
    retry: refreshAccess,
  };
}

export function formatStat(stat: LiveStat) {
  if (stat.forbidden || stat.error || stat.total === null) {
    return "—";
  }
  return String(stat.total);
}

export function formatStatHint(stat: LiveStat, okHint: string) {
  if (stat.forbidden) {
    return "You don't have access to this section.";
  }
  if (stat.error || stat.total === null) {
    return "We couldn't load this information. Please try again.";
  }
  if (stat.total === 0) {
    return "No records yet";
  }
  return okHint;
}
