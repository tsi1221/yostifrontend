import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

/* =========================================================
   AUTH
========================================================= */

import Login from "./shared/Auth/login/Login";
import Register from "./shared/Auth/Register";
import ForgotPassword from "./shared/Auth/ForgotPassword";
import TwoFA from "./shared/Auth/TwoFA";

/* =========================================================
   ROLE ROUTING
========================================================= */

import SuperAdminRouting from "./Superadmin/Routing/SuperAdminRouting";

/*
  Add these when their routing files are ready:

  import AdminRouting from "./Admin/Routing/AdminRouting";
  import BuyerRouting from "./Buyer/Routing/BuyerRouting";
  import SupplierRouting from "./Supplier/Routing/SupplierRouting";
  import LogisticsRouting from "./Logistics/Routing/LogisticsRouting";
*/

/* =========================================================
   PUBLIC HOME
========================================================= */

import Navbar from "./Pages/Home/Navbar";
import Footer from "./Pages/Home/Footer";
import HeroSection from "./Pages/Home/HeroSection";
import AboutSection from "./Pages/Home/AboutSection";
import ServicesSection from "./Pages/Home/ServicesSection";
import ContactSection from "./Pages/Home/ContactSection";
import Blog from "./Pages/Home/Blog";
import WhyChoose from "./Pages/Home/Whychoose";
import OurProject from "./Pages/Home/Ourproject";
import Statics from "./Pages/Home/Statics";
import TestimonialsPage from "./Pages/Home/TestimonialsSection";
import ProductsSection from "./Pages/Home/ExportProductsSection";
import Staff from "./Pages/Home/Staff";

/* =========================================================
   PRODUCT PAGES
========================================================= */

import ProductPage from "./Pages/Home/product";

/* =========================================================
   ROLE TYPE
========================================================= */

import type { UserRole } from "./shared/layout/Sidebar";

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

  const normalized = value
    .trim()
    .toUpperCase();

  if (
    VALID_ROLES.includes(
      normalized as UserRole
    )
  ) {
    return normalized as UserRole;
  }

  /*
    Also support old lowercase values that
    may already exist in localStorage.
  */

  switch (value.trim().toLowerCase()) {
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
   APP
========================================================= */

export default function App() {
  const location = useLocation();

  const [role, setRole] =
    useState<UserRole | null>(null);

  const [, setEmail] =
    useState<string | null>(null);

  /* =======================================================
     LOAD STORED AUTHENTICATION
  ======================================================= */

  useEffect(() => {
    const storedRole =
      localStorage.getItem("role") ||
      sessionStorage.getItem("role");

    const storedEmail =
      localStorage.getItem("email") ||
      sessionStorage.getItem("email");

    const normalizedRole =
      normalizeRole(storedRole);

    if (normalizedRole) {
      setRole(normalizedRole);
    } else {
      setRole(null);
    }

    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setEmail(null);
    }
  }, []);

  /* =======================================================
     AUTH PAGES
  ======================================================= */

  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/two-fa",
    "/2fa",
  ].includes(location.pathname);

  /* =======================================================
     PUBLIC PAGES
  ======================================================= */

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname.startsWith("/about") ||
    location.pathname.startsWith("/services") ||
    location.pathname.startsWith("/industries") ||
    location.pathname.startsWith("/contact") ||
    location.pathname.startsWith("/blog") ||
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/projectt") ||
    location.pathname.startsWith("/ourproject") ||
    location.pathname.startsWith("/staffs");

  /* =======================================================
     AUTH ROUTES
  ======================================================= */

  if (isAuthPage) {
    return (
      <Routes>
        {/* LOGIN */}

        <Route
          path="/login"
          element={
            <Login
              setRole={setRole}
              setEmail={setEmail}
            />
          }
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* FORGOT PASSWORD */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* TWO FACTOR */}

        <Route
          path="/two-fa"
          element={<TwoFA />}
        />

        {/* TWO FACTOR ALIAS */}

        <Route
          path="/2fa"
          element={<TwoFA />}
        />

        {/* AUTH FALLBACK */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  /* =======================================================
     MAIN APPLICATION
  ======================================================= */

  return (
    <div className="min-h-screen bg-white">
      {/* ===================================================
          PUBLIC NAVBAR
      =================================================== */}

      {isPublicPage && <Navbar />}

      {/* ===================================================
          ROUTES
      =================================================== */}

      <Routes>
        {/* =================================================
            HOME
        ================================================== */}

        <Route
          path="/"
          element={
            <>
              <HeroSection />

              <ProductsSection />

              <ServicesSection />

              <WhyChoose />

              <Statics />

              <TestimonialsPage />
            </>
          }
        />

        {/* =================================================
            ABOUT
        ================================================== */}

        <Route
          path="/about"
          element={
            <AboutSection />
          }
        />

        {/* =================================================
            SERVICES
        ================================================== */}

        <Route
          path="/services"
          element={
            <ServicesSection />
          }
        />

        {/* =================================================
            INDUSTRIES
        ================================================== */}

        <Route
          path="/industries"
          element={
            <ProductsSection />
          }
        />

        {/* =================================================
            CONTACT
        ================================================== */}

        <Route
          path="/contact"
          element={
            <ContactSection />
          }
        />

        {/* =================================================
            BLOG
        ================================================== */}

        <Route
          path="/blog/news"
          element={
            <Blog />
          }
        />

        {/* =================================================
            PRODUCTS
        ================================================== */}

        <Route
          path="/products"
          element={
            <ProductPage />
          }
        />

        {/* =================================================
            PROJECT PAGE
        ================================================== */}

        <Route
          path="/projectt"
          element={
            <ProductPage />
          }
        />

        {/* =================================================
            OUR PROJECTS
        ================================================== */}

        <Route
          path="/ourproject"
          element={
            <OurProject />
          }
        />

        {/* =================================================
            STAFF
        ================================================== */}

        <Route
          path="/staffs"
          element={
            <Staff />
          }
        />

        {/* =================================================
            LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={
            <Login
              setRole={setRole}
              setEmail={setEmail}
            />
          }
        />

        {/* =================================================
            REGISTER
        ================================================== */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        {/* =================================================
            FORGOT PASSWORD
        ================================================== */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        {/* =================================================
            TWO FA
        ================================================== */}

        <Route
          path="/two-fa"
          element={
            <TwoFA />
          }
        />

        <Route
          path="/2fa"
          element={
            <TwoFA />
          }
        />

        {/* =================================================
            SUPER ADMIN
        ================================================== */}

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
            ADMIN / STAFF
        ================================================== */}

        {/*
        <Route
          path="/admin/*"
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
            BUYER
        ================================================== */}

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
            SUPPLIER
        ================================================== */}

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
            LOGISTICS
        ================================================== */}

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
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            role === "SUPER_ADMIN" ? (
              <Navigate
                to="/superadmin"
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

      {/* ===================================================
          PUBLIC FOOTER
      =================================================== */}

      {isPublicPage && <Footer />}
    </div>
  );
}