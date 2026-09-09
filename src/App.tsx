
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
import DashboardApp from "./dashboard/DashboardApp";
import {
  RequireAuth,
  AuthProvider,
  useAuth,
  getRoleDashboardPath,
} from "./dashboard/auth";

import Navbar from "./pages/home/Navbar";
import Footer from "./pages/home/Footer";

import HeroSection from "./pages/home/HeroSection";
import AboutSection from "./pages/home/AboutSection";
import ServicesSection from "./pages/home/ServicesSection";
import ContactSection from "./pages/home/ContactSection";
import Blog from "./pages/home/Blog";
import WhyChoose from "./pages/home/Whychoose";
import OurProject from "./pages/home/Ourproject";
import Statics from "./pages/home/Statics";
import TestimonialsPage from "./pages/home/TestimonialsSection";
import ProductsSection from "./pages/home/ExportProductsSection";
import Staff from "./pages/home/Staff";

import ProductPage from "./pages/home/product";
import PublicBlogDetail from "./dashboard/blogs/PublicBlogDetail";
import PublicBlogsPage from "./dashboard/blogs/PublicBlogsPage";
import PublicProjectDetail from "./dashboard/projects/PublicProjectDetail";
import PublicProjectsPage from "./dashboard/projects/PublicProjectsPage";
import PublicContactForm from "./dashboard/contacts/PublicContactForm";

import type { UserRole } from "./shared/layout/Sidebar";

const getRoleHome = (role: UserRole | null) =>
  role ? getRoleDashboardPath(role) : "/";

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

function AppRoutes() {
  const { role } = useAuth();

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

      <Route
        path="/contacts"
        element={
          <PublicLayout>
            <PublicContactForm />
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

      <Route
        path="/blogs/:blogId"
        element={
          <PublicLayout>
            <PublicBlogDetail />
          </PublicLayout>
        }
      />

      <Route
        path="/blog/:blogId"
        element={
          <PublicLayout>
            <PublicBlogDetail />
          </PublicLayout>
        }
      />

      <Route
        path="/blogs"
        element={
          <PublicLayout>
            <PublicBlogsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <PublicLayout>
            <PublicProjectDetail />
          </PublicLayout>
        }
      />

      <Route
        path="/projects"
        element={
          <PublicLayout>
            <PublicProjectsPage />
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
        element={<Login />}
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
        path="/dashboard/*"
        element={
          <RequireAuth
            allow={[
              "SUPER_ADMIN",
              "STAFF",
              "BUYER",
              "SUPPLIER",
              "LOGISTICS_PARTNER",
            ]}
          >
            <DashboardApp />
          </RequireAuth>
        }
      />

      <Route
        path="/superadmin/*"
        element={
          <RequireAuth
            allow={[
              "SUPER_ADMIN",
              "STAFF",
              "BUYER",
              "SUPPLIER",
              "LOGISTICS_PARTNER",
            ]}
          >
            <SuperAdminRouting />
          </RequireAuth>
        }
      />

      <Route
        path="/staff/*"
        element={
          <RequireAuth allow={["SUPER_ADMIN", "STAFF", "BUYER", "SUPPLIER", "LOGISTICS_PARTNER"]}>
            <DashboardApp />
          </RequireAuth>
        }
      />

      <Route
        path="/buyer/*"
        element={
          <RequireAuth allow={["SUPER_ADMIN", "STAFF", "BUYER", "SUPPLIER", "LOGISTICS_PARTNER"]}>
            <DashboardApp />
          </RequireAuth>
        }
      />

      <Route
        path="/supplier/*"
        element={
          <RequireAuth allow={["SUPER_ADMIN", "STAFF", "BUYER", "SUPPLIER", "LOGISTICS_PARTNER"]}>
            <DashboardApp />
          </RequireAuth>
        }
      />

      <Route
        path="/logistics/*"
        element={
          <RequireAuth allow={["SUPER_ADMIN", "STAFF", "BUYER", "SUPPLIER", "LOGISTICS_PARTNER"]}>
            <DashboardApp />
          </RequireAuth>
        }
      />

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

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
