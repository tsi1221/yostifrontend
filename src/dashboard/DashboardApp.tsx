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
import RequestDetailView from "./requests/RequestDetailView";
import SourcingPage from "./views/SourcingPage";
import CreateShipmentForm from "./shipments/CreateShipmentForm";
import ShipmentsPage from "./views/ShipmentsPage";
import CreateInspectionForm from "./inspections/CreateInspectionForm";
import InspectionDetailView from "./inspections/InspectionDetailView";
import InspectionsPage from "./views/InspectionsPage";
import CreateTripForm from "./trips/CreateTripForm";
import TripDetailView from "./trips/TripDetailView";
import TripsPage from "./views/TripsPage";
import CreatePaymentForm from "./payments/CreatePaymentForm";
import PaymentDetailView from "./payments/PaymentDetailView";
import PaymentsPage from "./views/PaymentsPage";
import CreateTicketForm from "./tickets/CreateTicketForm";
import SupportTicketDetailView from "./tickets/SupportTicketDetailView";
import SupportPage from "./views/SupportPage";
import CreateServiceForm from "./services/CreateServiceForm";
import ServicesPage from "./views/ServicesPage";

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
          path="sourcing/:requestId"
          element={
            <Guard role={role} page="sourcing">
              <RequestDetailView />
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
          path="logistics/new"
          element={
            <Guard role={role} page="logistics">
              <CreateShipmentForm />
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
          path="quality-control/new"
          element={
            <Guard role={role} page="quality-control">
              <CreateInspectionForm />
            </Guard>
          }
        />
        <Route
          path="quality-control/:inspectionId"
          element={
            <Guard role={role} page="quality-control">
              <InspectionDetailView />
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
          path="trips/new"
          element={
            <Guard role={role} page="trips">
              <CreateTripForm />
            </Guard>
          }
        />
        <Route
          path="trips/:tripId"
          element={
            <Guard role={role} page="trips">
              <TripDetailView />
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
          path="payments/new"
          element={
            <Guard role={role} page="payments">
              <CreatePaymentForm />
            </Guard>
          }
        />
        <Route
          path="payments/:paymentId"
          element={
            <Guard role={role} page="payments">
              <PaymentDetailView />
            </Guard>
          }
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
          path="services/new"
          element={
            <Guard role={role} page="services">
              <CreateServiceForm />
            </Guard>
          }
        />
        <Route
          path="services"
          element={
            <Guard role={role} page="services">
              <ServicesPage />
            </Guard>
          }
        />
        <Route
          path="supports/new"
          element={
            <Guard role={role} page="supports">
              <CreateTicketForm />
            </Guard>
          }
        />
        <Route
          path="supports/:ticketId"
          element={
            <Guard role={role} page="supports">
              <SupportTicketDetailView />
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
