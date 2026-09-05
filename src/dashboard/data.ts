import { dashboardSnapshot } from "./mocks/data";
import type { User, UserRole } from "./types";

const SESSION_USERS: Record<UserRole, string> = {
  SUPER_ADMIN: "u-admin",
  STAFF: "u-staff",
  BUYER: "u-buyer-1",
  SUPPLIER: "u-supplier-1",
  LOGISTICS_PARTNER: "u-logistics-1",
};

export const getSessionUser = (role: UserRole): User => {
  const user = dashboardSnapshot.users.find(
    (item) => item.id === SESSION_USERS[role]
  );

  return user ?? dashboardSnapshot.users[0];
};

export const getUsers = (role: UserRole) => {
  if (role === "SUPER_ADMIN") {
    return dashboardSnapshot.users;
  }

  return dashboardSnapshot.users.filter((user) => user.id === SESSION_USERS[role]);
};

export const getSourcingRequests = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.sourcingRequests;
  }

  if (role === "BUYER") {
    return dashboardSnapshot.sourcingRequests.filter((row) => row.buyerId === userId);
  }

  if (role === "SUPPLIER") {
    const requestIds = dashboardSnapshot.quotes
      .filter((quote) => quote.supplierId === userId)
      .map((quote) => quote.requestId);
    const openRequests = dashboardSnapshot.sourcingRequests.filter(
      (row) => row.status === "OPEN"
    );
    return dashboardSnapshot.sourcingRequests.filter(
      (row) => requestIds.includes(row.id) || openRequests.some((open) => open.id === row.id)
    );
  }

  return [];
};

export const getQuotes = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.quotes;
  }

  if (role === "SUPPLIER") {
    return dashboardSnapshot.quotes.filter((row) => row.supplierId === userId);
  }

  if (role === "BUYER") {
    const requestIds = dashboardSnapshot.sourcingRequests
      .filter((row) => row.buyerId === userId)
      .map((row) => row.id);
    return dashboardSnapshot.quotes.filter((row) => requestIds.includes(row.requestId));
  }

  return [];
};

export const getShipments = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.shipments;
  }

  if (role === "BUYER") {
    return dashboardSnapshot.shipments.filter((row) => row.buyerId === userId);
  }

  if (role === "SUPPLIER") {
    return dashboardSnapshot.shipments.filter((row) => row.supplierId === userId);
  }

  if (role === "LOGISTICS_PARTNER") {
    return dashboardSnapshot.shipments.filter(
      (row) => row.logisticsPartnerId === userId
    );
  }

  return [];
};

export const getInspections = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.inspections;
  }

  if (role === "BUYER") {
    return dashboardSnapshot.inspections.filter((row) => row.buyerId === userId);
  }

  if (role === "SUPPLIER") {
    return dashboardSnapshot.inspections.filter((row) => row.supplierId === userId);
  }

  return [];
};

export const getTrips = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF" || role === "LOGISTICS_PARTNER") {
    return dashboardSnapshot.trips;
  }

  if (role === "BUYER") {
    return dashboardSnapshot.trips.filter((row) => row.buyerId === userId);
  }

  return [];
};

export const getVisas = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.visas;
  }

  if (role === "BUYER") {
    return dashboardSnapshot.visas.filter((row) => row.buyerId === userId);
  }

  return [];
};

export const getPayments = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.payments;
  }

  if (role === "BUYER") {
    return dashboardSnapshot.payments.filter((row) => row.buyerId === userId);
  }

  return [];
};

export const getTickets = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.tickets;
  }

  return dashboardSnapshot.tickets.filter((row) => row.userId === userId);
};

export const getActivity = (role: UserRole, userId: string) => {
  if (role === "SUPER_ADMIN" || role === "STAFF") {
    return dashboardSnapshot.activity;
  }

  return dashboardSnapshot.activity.filter((row) => row.actorId === userId);
};

export const findUserName = (id: string) =>
  dashboardSnapshot.users.find((user) => user.id === id)?.fullName ?? id;

export { dashboardSnapshot };
