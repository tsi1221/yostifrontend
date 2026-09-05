import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import DashboardShell from "./layout/DashboardShell";
import { ROLE_SLUG, roleCanAccess, type DashboardPageKey } from "./roles";
import type { UserRole } from "./types";
import Overview from "./views/Overview";
import UsersPage from "./views/UsersPage";
import SourcingPage from "./views/SourcingPage";
import ShipmentsPage from "./views/ShipmentsPage";
import InspectionsPage from "./views/InspectionsPage";
import TripsPage from "./views/TripsPage";
import PaymentsPage from "./views/PaymentsPage";
import VisasPage from "./views/VisasPage";
import ServicesPage from "./views/ServicesPage";
import { BlogsPage, ProjectsPage } from "./views/ContentPages";
import { ContactsPage, FilesPage, SupportPage } from "./views/AdminPages";

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

export default function DashboardApp({ role }: DashboardAppProps) {
  const home = `/${ROLE_SLUG[role]}/dashboard`;

  return (
    <DashboardShell role={role}>
      <Routes>
        <Route index element={<Navigate to={home} replace />} />
        <Route
          path="dashboard"
          element={
            <Guard role={role} page="dashboard">
              <Overview role={role} />
            </Guard>
          }
        />
        <Route
          path="users"
          element={
            <Guard role={role} page="users">
              <UsersPage role={role} />
            </Guard>
          }
        />
        <Route
          path="sourcing"
          element={
            <Guard role={role} page="sourcing">
              <SourcingPage role={role} />
            </Guard>
          }
        />
        <Route
          path="logistics"
          element={
            <Guard role={role} page="logistics">
              <ShipmentsPage role={role} />
            </Guard>
          }
        />
        <Route
          path="quality-control"
          element={
            <Guard role={role} page="quality-control">
              <InspectionsPage role={role} />
            </Guard>
          }
        />
        <Route
          path="trips"
          element={
            <Guard role={role} page="trips">
              <TripsPage role={role} />
            </Guard>
          }
        />
        <Route
          path="visa-invitations"
          element={
            <Guard role={role} page="visa-invitations">
              <VisasPage role={role} />
            </Guard>
          }
        />
        <Route
          path="payments"
          element={
            <Guard role={role} page="payments">
              <PaymentsPage role={role} />
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
          path="blogs"
          element={
            <Guard role={role} page="blogs">
              <BlogsPage />
            </Guard>
          }
        />
        <Route
          path="projects"
          element={
            <Guard role={role} page="projects">
              <ProjectsPage />
            </Guard>
          }
        />
        <Route
          path="contacts"
          element={
            <Guard role={role} page="contacts">
              <ContactsPage />
            </Guard>
          }
        />
        <Route
          path="files"
          element={
            <Guard role={role} page="files">
              <FilesPage />
            </Guard>
          }
        />
        <Route
          path="supports"
          element={
            <Guard role={role} page="supports">
              <SupportPage role={role} />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </DashboardShell>
  );
}
