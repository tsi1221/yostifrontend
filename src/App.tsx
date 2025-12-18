// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

/* ===================== LAYOUT ===================== */
import Sidebar, { type Role } from "./components/Sidebar";
import Header from "./components/Header";

/* ===================== ADMIN ===================== */
import AdminDashboard from "./pages/Admin/Dashboard";
import Blogs from "./pages/Admin/Blogs";
import SourcingDashboard from "./pages/Admin/Sourcing";
import SupportTable from "./pages/Admin/Support";
import Shipments from "./pages/Admin/Shipments";
import Inspections from "./pages/Admin/Inspections";
import Payments from "./pages/Admin/Payments";
import AdminProfile from "./pages/Admin/Profile";

/* ===================== BUYER ===================== */
import BuyerDashboard from "./pages/buyer/Dashboard";
import Requests from "./pages/buyer/MyRequests";
import Quotes from "./pages/buyer/MyQuotes";
import Trips from "./pages/buyer/MyTrips";
import MyShipments from "./pages/buyer/MyShipments";
import MyPayments from "./pages/buyer/MyPayments";
import Support from "./pages/buyer/Support";
import BuyerProfile from "./pages/buyer/Profile";
import MyInspectionsBuyer from "./pages/buyer/MyInspections";

/* ===================== SUPPLIER ===================== */
import SupplierDashboard from "./pages/Supplier/Dashboard";
import MyQuotes from "./pages/Supplier/MyQuotes";
import MyInspections from "./pages/Supplier/MyInspections";
import VerificationStatus from "./pages/Supplier/VerificationStatus";
import SupplierProfile from "./pages/Supplier/Profile";

/* ===================== SUPER ADMIN ===================== */
import SuperDashboard from "./pages/superadmin/Dashboard";
import SourcingRequests from "./pages/superadmin/SourcingRequests";
import SuperAdminQuotes from "./pages/superadmin/SupplierQuotes";
import AllSuppliers from "./pages/superadmin/Suppliers";
import BusinessTrips from "./pages/superadmin/BusinessTrips";
import SupportTickets from "./pages/superadmin/SupportTickets";
import StaffManagement from "./pages/superadmin/StaffManagement";
import AllShipments from "./pages/superadmin/Shipments";
import AllInspections from "./pages/superadmin/Inspections";
import AllPayments from "./pages/superadmin/Payments";
import AllExportProducts from "./pages/superadmin/ExportProducts";
import AllBlog from "./pages/superadmin/Blog";
import AllTestimonials from "./pages/superadmin/Testimonials";
import AllUsers from "./pages/superadmin/Users";
import Settings from "./pages/superadmin/Settings";

/* ===================== PUBLIC ===================== */
import Navbar from "./pages/Home/Navbar";
import Footer from "./pages/Home/Footer";
import HeroSection from "./pages/Home/HeroSection";
import AboutSection from "./pages/Home/AboutSection";
import ServicesSection from "./pages/Home/ServicesSection";
import ContactSection from "./pages/Home/ContactSection";
import Blog from "./pages/Home/Blog";
import WhyChoose from "./pages/Home/Whychoose";
import OURPROJECT from "./pages/Home/Ourproject";
import ProductPage from "./pages/product/product";
import Productt from "./pages/Home/product";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TwoFA from "./pages/TwoFA";
import ForgotPassword from "./pages/ForgotPassword";
import Statics from "./pages/Home/Statics";
import TestimonialsPage from "./pages/Home/TestimonialsSection";
import ProductsSection from "./pages/Home/ExportProductsSection";

const App = () => {
  const location = useLocation();
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  /* ===================== LOAD AUTH ===================== */
  useEffect(() => {
    const r =
      (localStorage.getItem("role") ||
        sessionStorage.getItem("role")) as Role | null;

    const e =
      localStorage.getItem("email") || sessionStorage.getItem("email");

    if (r) setRole(r);
    if (e) setEmail(e);
  }, []);

  /* ===================== DASHBOARD ROUTES ===================== */
  const dashboardRoutes: Record<Role, string[]> = {
    admin: [
      "/admin/dashboard",
      "/blogs",
      "/sourcing",
      "/support",
      "/shipments",
      "/inspections",
      "/payments",
      "/profile",
    ],
    buyer: [
      "/buyer/dashboard",
      "/requests",
      "/quotes",
      "/trips",
      "/shipments",
      "/payments",
      "/support",
      "/buyerinspection",
      "/buyerprofile",
    ],
    supplier: [
      "/supplier/dashboard",
      "/my-quotes",
      "/my-inspections",
      "/verification-status",
      "/supplier/profile",
    ],
    logistics: [],
    student: [],
    "super-admin": [
      "/superadmin/dashboard",
      "/allsourcing",
      "/allquotes",
      "/allsuppliers",
      "/alltrips",
      "/all-support-tickets",
      "/staff-management",
      "/allshipments",
      "/allinspections",
      "/allpayments",
      "/all-port-products",
      "/allblogs",
      "/alltestimonials",
      "/allusers",
      "/settings",
    ],
  };

  const isDashboardRoute =
    role && dashboardRoutes[role]?.includes(location.pathname);

  const isAuthPage = ["/login", "/register", "/2fa", "/forgot-password"].includes(
    location.pathname
  );

  /* ===================== DASHBOARD LAYOUT ===================== */
  if (isDashboardRoute && role) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar role={role} />

        {/* Main Content */}
        <div className="flex flex-col flex-1 bg-gray-50">
          {email && (
            <Header role={role} email={email} setRole={setRole} />
          )}

          <main className="flex-1 mt-16 p-4 overflow-y-auto">
            <Routes>
              {/* ADMIN */}
              {role === "admin" && (
                <>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/sourcing" element={<SourcingDashboard />} />
                  <Route path="/support" element={<SupportTable />} />
                  <Route path="/shipments" element={<Shipments />} />
                  <Route path="/inspections" element={<Inspections />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/profile" element={<AdminProfile />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                </>
              )}

              {/* BUYER */}
              {role === "buyer" && (
                <>
                  <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/shipments" element={<MyShipments />} />
                  <Route path="/payments" element={<MyPayments />} />
                  <Route path="/support" element={<Support />} />
                  <Route
                    path="/buyerinspection"
                    element={<MyInspectionsBuyer />}
                  />
                  <Route path="/buyerprofile" element={<BuyerProfile />} />
                  <Route path="*" element={<Navigate to="/buyer/dashboard" />} />
                </>
              )}

              {/* SUPPLIER */}
              {role === "supplier" && (
                <>
                  <Route
                    path="/supplier/dashboard"
                    element={<SupplierDashboard />}
                  />
                  <Route path="/my-quotes" element={<MyQuotes />} />
                  <Route path="/my-inspections" element={<MyInspections />} />
                  <Route
                    path="/verification-status"
                    element={<VerificationStatus />}
                  />
                  <Route
                    path="/supplier/profile"
                    element={<SupplierProfile />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/supplier/dashboard" />}
                  />
                </>
              )}

              {/* SUPER ADMIN */}
              {role === "super-admin" && (
                <>
                  <Route
                    path="/superadmin/dashboard"
                    element={<SuperDashboard />}
                  />
                  <Route path="/allsourcing" element={<SourcingRequests />} />
                  <Route path="/allquotes" element={<SuperAdminQuotes />} />
                  <Route path="/allsuppliers" element={<AllSuppliers />} />
                  <Route path="/alltrips" element={<BusinessTrips />} />
                  <Route
                    path="/all-support-tickets"
                    element={<SupportTickets />}
                  />
                  <Route
                    path="/staff-management"
                    element={<StaffManagement />}
                  />
                  <Route path="/allshipments" element={<AllShipments />} />
                  <Route path="/allinspections" element={<AllInspections />} />
                  <Route path="/allpayments" element={<AllPayments />} />
                  <Route
                    path="/all-port-products"
                    element={<AllExportProducts />}
                  />
                  <Route path="/allblogs" element={<AllBlog />} />
                  <Route
                    path="/alltestimonials"
                    element={<AllTestimonials />}
                  />
                  <Route path="/allusers" element={<AllUsers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route
                    path="*"
                    element={<Navigate to="/superadmin/dashboard" />}
                  />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  /* ===================== PUBLIC LAYOUT ===================== */
  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
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
        <Route path="/about" element={<AboutSection />} />
        <Route path="/services" element={<ServicesSection />} />
        <Route path="/industries" element={<ProductsSection />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/blog/news" element={<Blog />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/projectt" element={<Productt />} />
        <Route path="/ourproject" element={<OURPROJECT />} />
        <Route path="/2fa" element={<TwoFA />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/login"
          element={<Login setRole={setRole} setEmail={setEmail} />}
        />
        <Route path="/register" element={<Register />} />
      </Routes>

      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;
