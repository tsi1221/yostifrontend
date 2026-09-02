
import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../../../shared/layout/DashboardLayout";

// Dashboard
import Dashboard from "../../Dashbaord/Dashboard";

// Logistics & Operations
import CargoandTracking from "../../Logistics&Operations/CargoandTracking";
import QualityControl from "../../Logistics&Operations/QualityControl";
import Trips from "../../Logistics&Operations/Trips";

// Commercial
import VisaInvitations from "../../Commercial/VisaInvitations";
import Payments from "../../Commercial/Payments";
import Services from "../../Commercial/Services";

// Content
import Blogs from "../Blogs";
import Projects from "../Routing/Projects";

// Administration
import UsersManagment from "../../Administarction/UsersManagment";
import Contacts from "../../Administarction/Contact";
import Files from "../../Administarction/Files";

// Support
import Supports from "../../Support/Supports";

export default function SuperAdminRouting() {
  return (
    <DashboardLayout role="SUPER_ADMIN">
      <Routes>
        {/* =================================================
            DEFAULT SUPER ADMIN ROUTE
        ================================================= */}

        <Route
          index
          element={
            <Navigate
              to="/superadmin/dashboard"
              replace
            />
          }
        />

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        {/* =================================================
            LOGISTICS & OPERATIONS
        ================================================= */}

        <Route
          path="logistics"
          element={<CargoandTracking />}
        />

        <Route
          path="quality-control"
          element={<QualityControl />}
        />

        <Route
          path="trips"
          element={<Trips />}
        />

        {/* =================================================
            COMMERCIAL
        ================================================= */}

        <Route
          path="visa-invitations"
          element={<VisaInvitations />}
        />

        <Route
          path="payments"
          element={<Payments />}
        />

        <Route
          path="services"
          element={<Services />}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <Route
          path="blogs"
          element={<Blogs />}
        />

        <Route
          path="projects"
          element={<Projects />}
        />

        {/* =================================================
            ADMINISTRATION
        ================================================= */}

        <Route
          path="users"
          element={<UsersManagment />}
        />

        <Route
          path="contacts"
          element={<Contacts />}
        />

        <Route
          path="files"
          element={<Files />}
        />

        {/* =================================================
            SUPPORT
        ================================================= */}

        <Route
          path="supports"
          element={<Supports />}
        />

        {/* =================================================
            UNKNOWN SUPER ADMIN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/superadmin/dashboard"
              replace
            />
          }
        />
      </Routes>
    </DashboardLayout>
  );
}
