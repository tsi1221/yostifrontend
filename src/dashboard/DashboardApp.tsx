import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import { hasValidAccessToken } from "./auth/session";
import DashboardShell from "./layout/DashboardShell";
import { ROLE_SLUG, roleCanAccess, type DashboardPageKey } from "./roles";
import { DashboardProvider } from "./store";
import type { UserRole } from "./types";
import Overview from "./views/Overview";
import UsersPage from "./views/UsersPage";
import VerificationsPage from "./views/VerificationsPage";
import SourcingPage from "./views/SourcingPage";
import ShipmentsPage from "./views/ShipmentsPage";
import InspectionsPage from "./views/InspectionsPage";
import TripsPage from "./views/TripsPage";
import PaymentsPage from "./views/PaymentsPage";
import SupportPage from "./views/SupportPage";

interface DashboardAppProps {
  role: UserRole;
}

function Guard({
  role,
  page,
  children,
}: {
  role: UserRole;
  page: DashboardPageKey;
  children: ReactNode;
}) {
  if (!roleCanAccess(role, page)) {
    return <Navigate to={`/${ROLE_SLUG[role]}/dashboard`} replace />;
  }

  return children;
}

function DashboardRoutes({ role }: DashboardAppProps) {
  const home = `/${ROLE_SLUG[role]}/dashboard`;

  return (
    <DashboardShell role={role}>
      <Routes>
        <Route index element={<Navigate to={home} replace />} />
        <Route
          path="dashboard"
          element={
            <Guard role={role} page="dashboard">
              <Overview />
            </Guard>
          }
        />
        <Route
          path="users"
          element={
            <Guard role={role} page="users">
              <UsersPage />
            </Guard>
          }
        />
        <Route
          path="verifications"
          element={
            <Guard role={role} page="verifications">
              <VerificationsPage />
            </Guard>
          }
        />
        <Route
          path="sourcing"
          element={
            <Guard role={role} page="sourcing">
              <SourcingPage />
            </Guard>
          }
        />
        <Route
          path="logistics"
          element={
            <Guard role={role} page="logistics">
              <ShipmentsPage />
            </Guard>
          }
        />
        <Route
          path="quality-control"
          element={
            <Guard role={role} page="quality-control">
              <InspectionsPage />
            </Guard>
          }
        />
        <Route
          path="trips"
          element={
            <Guard role={role} page="trips">
              <TripsPage />
            </Guard>
          }
        />
        <Route
          path="visa-invitations"
          element={<Navigate to={`/${ROLE_SLUG[role]}/trips`} replace />}
        />
        <Route
          path="payments"
          element={
            <Guard role={role} page="payments">
              <PaymentsPage />
            </Guard>
          }
        />
        <Route
          path="supports"
          element={
            <Guard role={role} page="supports">
              <SupportPage />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </DashboardShell>
  );
}

export default function DashboardApp({ role }: DashboardAppProps) {
  if (!hasValidAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardProvider role={role}>
      <DashboardRoutes role={role} />
    </DashboardProvider>
  );
}
