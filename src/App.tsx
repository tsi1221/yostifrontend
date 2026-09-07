
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
        path="/superadmin/*"
        element={
          <RequireAuth allow="SUPER_ADMIN">
            <SuperAdminRouting />
          </RequireAuth>
        }
      />

      <Route
        path="/staff/*"
        element={
          <RequireAuth allow={["STAFF", "SUPER_ADMIN"]}>
            <DashboardApp role="STAFF" />
          </RequireAuth>
        }
      />

      <Route
        path="/buyer/*"
        element={
          <RequireAuth allow={["BUYER", "SUPER_ADMIN"]}>
            <DashboardApp role="BUYER" />
          </RequireAuth>
        }
      />

      <Route
        path="/supplier/*"
        element={
          <RequireAuth allow={["SUPPLIER", "SUPER_ADMIN"]}>
            <DashboardApp role="SUPPLIER" />
          </RequireAuth>
        }
      />

      <Route
        path="/logistics/*"
        element={
          <RequireAuth allow={["LOGISTICS_PARTNER", "SUPER_ADMIN"]}>
            <DashboardApp role="LOGISTICS_PARTNER" />
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
