
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./shared/Auth/login/Login";
import Register from "./shared/Auth/Register";
import ForgotPassword from "./shared/Auth/ForgotPassword";
import TwoFA from "./shared/Auth/TwoFA";

import SuperAdminRouting from "./Superadmin/Content/Routing/SuperAdminRouting";

import Navbar from "./pages/Home/Navbar";
import Footer from "./pages/Home/Footer";

import HeroSection from "./pages/Home/HeroSection";
import AboutSection from "./pages/Home/AboutSection";
import ServicesSection from "./pages/Home/ServicesSection";
import ContactSection from "./pages/Home/ContactSection";
import Blog from "./pages/Home/Blog";
import WhyChoose from "./pages/Home/Whychoose";
import OurProject from "./pages/Home/Ourproject";
import Statics from "./pages/Home/Statics";
import TestimonialsPage from "./pages/Home/TestimonialsSection";
import ProductsSection from "./pages/Home/ExportProductsSection";
import Staff from "./pages/Home/Staff";

import ProductPage from "./pages/Home/product";

import type { UserRole } from "./shared/layout/Sidebar";

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   VALID ROLES
========================================================= */

const VALID_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "STAFF",
  "BUYER",
  "SUPPLIER",
  "LOGISTICS_PARTNER",
];

/* =========================================================
   NORMALIZE ROLE
========================================================= */

const normalizeRole = (
  value: string | null
): UserRole | null => {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  if (
    VALID_ROLES.includes(
      normalized as UserRole
    )
  ) {
    return normalized as UserRole;
  }

  switch (
    value.trim().toLowerCase()
  ) {
    case "super-admin":
    case "super_admin":
    case "superadmin":
      return "SUPER_ADMIN";

    case "staff":
    case "admin":
      return "STAFF";

    case "buyer":
      return "BUYER";

    case "supplier":
      return "SUPPLIER";

    case "logistics":
    case "logistics-partner":
    case "logistics_partner":
      return "LOGISTICS_PARTNER";

    default:
      return null;
  }
};

/* =========================================================
   ROLE HOME
========================================================= */

const getRoleHome = (
  role: UserRole | null
) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "/superadmin/dashboard";

    case "STAFF":
      return "/staff/dashboard";

    case "BUYER":
      return "/buyer/dashboard";

    case "SUPPLIER":
      return "/supplier/dashboard";

    case "LOGISTICS_PARTNER":
      return "/logistics/dashboard";

    default:
      return "/";
  }
};

/* =========================================================
   PUBLIC LAYOUT
========================================================= */

function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {children}

      <Footer />
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

const readStoredRole = (): UserRole | null =>
  normalizeRole(
    localStorage.getItem("role") ??
      sessionStorage.getItem("role")
  );

const readStoredEmail = (): string | null =>
  localStorage.getItem("email") ??
  sessionStorage.getItem("email");

export default function App() {
  const [role, setRole] =
    useState<UserRole | null>(readStoredRole);

  const [, setEmail] =
    useState<string | null>(readStoredEmail);

  /* =======================================================
     LOAD AUTH
  ======================================================= */

  useEffect(() => {
    setRole(readStoredRole());
    setEmail(readStoredEmail());
  }, []);

  return (
    <Routes>
      {/* =================================================
          PUBLIC HOME
      ================================================= */}

      <Route
        path="/"
        element={
          <PublicLayout>
            <HeroSection />

            <ProductsSection />

            <ServicesSection />

            <WhyChoose />

            <Statics />

            <TestimonialsPage />
          </PublicLayout>
        }
      />

      {/* =================================================
          ABOUT
      ================================================= */}

      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutSection />
          </PublicLayout>
        }
      />

      {/* =================================================
          SERVICES
      ================================================= */}

      <Route
        path="/services"
        element={
          <PublicLayout>
            <ServicesSection />
          </PublicLayout>
        }
      />

      {/* =================================================
          INDUSTRIES
      ================================================= */}

      <Route
        path="/industries"
        element={
          <PublicLayout>
            <ProductsSection />
          </PublicLayout>
        }
      />

      {/* =================================================
          CONTACT
      ================================================= */}

      <Route
        path="/contact"
        element={
          <PublicLayout>
            <ContactSection />
          </PublicLayout>
        }
      />

      {/* =================================================
          BLOG
      ================================================= */}

      <Route
        path="/blog/news"
        element={
          <PublicLayout>
            <Blog />
          </PublicLayout>
        }
      />

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <Route
        path="/products"
        element={
          <PublicLayout>
            <ProductPage />
          </PublicLayout>
        }
      />

      {/* =================================================
          PROJECT
      ================================================= */}

      <Route
        path="/projectt"
        element={
          <PublicLayout>
            <ProductPage />
          </PublicLayout>
        }
      />

      {/* =================================================
          OUR PROJECTS
      ================================================= */}

      <Route
        path="/ourproject"
        element={
          <PublicLayout>
            <OurProject />
          </PublicLayout>
        }
      />

      {/* =================================================
          STAFF
      ================================================= */}

      <Route
        path="/staffs"
        element={
          <PublicLayout>
            <Staff />
          </PublicLayout>
        }
      />

      {/* =================================================
          AUTH
      ================================================= */}

      <Route
        path="/login"
        element={
          <Login
            setRole={setRole}
            setEmail={setEmail}
          />
        }
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/two-fa"
        element={<TwoFA />}
      />

      <Route
        path="/2fa"
        element={<TwoFA />}
      />

      {/* =================================================
          SUPER ADMIN
      ================================================= */}

      <Route
        path="/superadmin/*"
        element={
          role === "SUPER_ADMIN" ? (
            <SuperAdminRouting />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />

      {/* =================================================
          FUTURE STAFF
      ================================================= */}

      {/*
      <Route
        path="/staff/*"
        element={
          role === "STAFF" ? (
            <AdminRouting />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />
      */}

      {/* =================================================
          FUTURE BUYER
      ================================================= */}

      {/*
      <Route
        path="/buyer/*"
        element={
          role === "BUYER" ? (
            <BuyerRouting />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />
      */}

      {/* =================================================
          FUTURE SUPPLIER
      ================================================= */}

      {/*
      <Route
        path="/supplier/*"
        element={
          role === "SUPPLIER" ? (
            <SupplierRouting />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />
      */}

      {/* =================================================
          FUTURE LOGISTICS
      ================================================= */}

      {/*
      <Route
        path="/logistics/*"
        element={
          role === "LOGISTICS_PARTNER" ? (
            <LogisticsRouting />
          ) : (
            <Navigate
              to="/login"
              replace
            />
          )
        }
      />
      */}

      {/* =================================================
          GLOBAL FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={
          role ? (
            <Navigate
              to={getRoleHome(role)}
              replace
            />
          ) : (
            <Navigate
              to="/"
              replace
            />
          )
        }
      />
    </Routes>
  );
}
