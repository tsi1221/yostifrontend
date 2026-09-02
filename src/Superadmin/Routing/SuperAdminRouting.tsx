
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../../shared/layout/DashboardLayout";

// Dashboard
import Dashboard from "../Dashbaord/Dashboard";

// Sourcing
import Sourcing from "../Sourcing/Sourcing";

// Suppliers
import Suppliers from "../suppliers/suppliers";

// Catalogs
import Catalogs from "../catalogs/catalogs";

// Logistics
import CargoandTracking from "../Logistics&Operations/CargoandTracking";

// Quality Control
import QualityControl from "../Logistics&Operations/QualityControl";

// Claims
import AfterSalesClaims from "../Logistics&Operations/AfterSalesClaims";

// Administration
import UsersManagment from "../Administarction/UsersManagment";
import RolesPermissions from "../Administarction/RolesPermissions";

// Settings
import Setting from "../Settings/Setting";

export default function SuperAdminRouting() {
  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Routes>

        {/* =========================
            DASHBOARD
        ========================= */}
        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            SOURCING & SUPPLIERS
        ========================= */}
        <Route
          path="sourcing"
          element={<Sourcing />}
        />

        <Route
          path="suppliers"
          element={<Suppliers />}
        />

        <Route
          path="catalogs"
          element={<Catalogs />}
        />

        {/* =========================
            LOGISTICS & OPERATIONS
        ========================= */}
        <Route
          path="logistics"
          element={<CargoandTracking />}
        />

        <Route
          path="quality-control"
          element={<QualityControl />}
        />

        <Route
          path="claims"
          element={<AfterSalesClaims />}
        />

        {/* =========================
            ADMINISTRATION
        ========================= */}
        <Route
          path="users"
          element={<UsersManagment />}
        />

        <Route
          path="roles"
          element={<RolesPermissions />}
        />

        {/* =========================
            SETTINGS
        ========================= */}
        <Route
          path="settings"
          element={<Setting />}
        />

        {/* =========================
            UNKNOWN ROUTE
        ========================= */}
        <Route
          path="*"
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />

      </Routes>
    </DashboardLayout>
  );
}

