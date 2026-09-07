import {
  ClipboardCheck,
  FileCheck,
  FileText,
  LifeBuoy,
  Package,
  Plane,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import ActionCard from "../components/ActionCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { ROLE_LABEL, ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import {
  formatStat,
  formatStatHint,
  useLiveDashboardStats,
} from "../useLiveDashboardStats";

export default function Overview() {
  const { role } = useDashboard();

  if (role === "SUPER_ADMIN") {
    return <BusinessIntelligenceHub />;
  }
  if (role === "STAFF") {
    return <StaffWorkspace />;
  }
  if (role === "BUYER") {
    return <BuyerWorkspace />;
  }
  if (role === "SUPPLIER") {
    return <SupplierWorkspace />;
  }
  return <LogisticsWorkspace />;
}

function RoleBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { role, user } = useDashboard();

  return (
    <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
        {ROLE_LABEL[role]}
      </p>
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/70">
        {description} Signed in as {user.full_name || user.email}
        {user.company_name ? `, ${user.company_name}` : ""}.
      </p>
    </section>
  );
}

function BuyerWorkspace() {
  const { role } = useDashboard();
  const stats = useLiveDashboardStats();
  const slug = ROLE_SLUG[role];

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Buyer workspace"
        description="Submit sourcing, track cargo, book inspections, and settle invoices."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My RFQs"
          value={stats.loading ? "…" : formatStat(stats.requests)}
          hint={formatStatHint(stats.requests, "Live sourcing requests")}
          icon={Package}
        />
        <StatCard
          title="Shipments"
          value={stats.loading ? "…" : formatStat(stats.shipments)}
          hint={formatStatHint(stats.shipments, "Cargo tracking")}
          icon={Truck}
        />
        <StatCard
          title="Inspections"
          value={stats.loading ? "…" : formatStat(stats.inspections)}
          hint={formatStatHint(stats.inspections, "Quality bookings")}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Payments"
          value={stats.loading ? "…" : formatStat(stats.payments)}
          hint={formatStatHint(stats.payments, "Invoice records")}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          to={`/${slug}/sourcing`}
          icon={Package}
          title="Submit Sourcing Request"
          description="Browse live sourcing requests from the Yosti API."
        />
        <ActionCard
          to={`/${slug}/logistics`}
          icon={Truck}
          title="Cargo Tracking System"
          description="Step-by-step timeline for active shipments."
        />
        <ActionCard
          to={`/${slug}/quality-control`}
          icon={ClipboardCheck}
          title="Request Quality Inspection"
          description="Book sample, pre-shipment, or factory-visit checks."
        />
        <ActionCard
          to={`/${slug}/trips`}
          icon={Plane}
          title="Submit Visa / Business Trip"
          description="Arrival city, passport, hotel, and translator."
        />
        <ActionCard
          to={`/${slug}/payments`}
          icon={Wallet}
          title="Payments & Invoices"
          description="Review live payment records."
        />
        <ActionCard
          to={`/${slug}/supports`}
          icon={LifeBuoy}
          title="Support requests"
          description="Open defect, damage, or missing-item tickets."
        />
      </div>
    </div>
  );
}

function SupplierWorkspace() {
  const { role } = useDashboard();
  const stats = useLiveDashboardStats();
  const slug = ROLE_SLUG[role];

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Factory workspace"
        description="Quote open RFQs and keep inspection windows."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Open RFQs"
          value={stats.loading ? "…" : formatStat(stats.requests)}
          hint={formatStatHint(stats.requests, "Live sourcing requests")}
          icon={FileText}
        />
        <StatCard
          title="Inspections"
          value={stats.loading ? "…" : formatStat(stats.inspections)}
          hint={formatStatHint(stats.inspections, "Assigned factory windows")}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Support"
          value={stats.loading ? "…" : formatStat(stats.supports)}
          hint={formatStatHint(stats.supports, "Live tickets")}
          icon={LifeBuoy}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          to={`/${slug}/verifications`}
          icon={FileCheck}
          title="Onboarding Verification"
          description="Current verification block and company profile form."
        />
        <ActionCard
          to={`/${slug}/sourcing`}
          icon={FileText}
          title="Open RFQs"
          description="Review live sourcing requests."
        />
        <ActionCard
          to={`/${slug}/quality-control`}
          icon={ClipboardCheck}
          title="Assigned Inspections"
          description="Calendar of factory check windows."
        />
      </div>
    </div>
  );
}

function LogisticsWorkspace() {
  const { role } = useDashboard();
  const stats = useLiveDashboardStats();
  const slug = ROLE_SLUG[role];

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Cargo handler console"
        description="Incoming bookings, status transitions, and shipping-document uploads."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Bookings"
          value={stats.loading ? "…" : formatStat(stats.shipments)}
          hint={formatStatHint(stats.shipments, "Live cargo records")}
          icon={Truck}
        />
        <StatCard
          title="Requests"
          value={stats.loading ? "…" : formatStat(stats.requests)}
          hint={formatStatHint(stats.requests, "Sourcing volume")}
          icon={Package}
        />
        <StatCard
          title="Inspections"
          value={stats.loading ? "…" : formatStat(stats.inspections)}
          hint={formatStatHint(stats.inspections, "Quality bookings")}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Support"
          value={stats.loading ? "…" : formatStat(stats.supports)}
          hint={formatStatHint(stats.supports, "Open tickets")}
          icon={LifeBuoy}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ActionCard
          to={`/${slug}/logistics`}
          icon={Truck}
          title="Shipment Bookings"
          description="Queue grid with Update Cargo Status and document uploads."
        />
        <ActionCard
          to={`/${slug}/supports`}
          icon={LifeBuoy}
          title="Support"
          description="Buyer issues tied to tracking numbers."
        />
      </div>
    </div>
  );
}

function StaffWorkspace() {
  const { role } = useDashboard();
  const stats = useLiveDashboardStats();
  const slug = ROLE_SLUG[role];

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Yosti operations desk"
        description="Dispatch RFQs, review QC reports, visas, and tickets."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Requests"
          value={stats.loading ? "…" : formatStat(stats.requests)}
          hint={formatStatHint(stats.requests, "Live sourcing volume")}
          icon={FileText}
        />
        <StatCard
          title="Users"
          value={stats.loading ? "…" : formatStat(stats.users)}
          hint={formatStatHint(stats.users, "Directory")}
          icon={Users}
        />
        <StatCard
          title="Visa files"
          value={stats.loading ? "…" : formatStat(stats.trips)}
          hint={formatStatHint(stats.trips, "Business trips")}
          icon={Plane}
        />
        <StatCard
          title="Open tickets"
          value={stats.loading ? "…" : formatStat(stats.supports)}
          hint={formatStatHint(stats.supports, "Client support")}
          icon={LifeBuoy}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          to={`/${slug}/verifications`}
          icon={FileCheck}
          title="Supplier Verification Queue"
          description="Review profiles and approve or reject onboarding."
        />
        <ActionCard
          to={`/${slug}/sourcing`}
          icon={FileText}
          title="Sourcing Assignment Board"
          description="Dispatch open RFQs to qualified factories."
        />
        <ActionCard
          to={`/${slug}/quality-control`}
          icon={ClipboardCheck}
          title="Quality reports"
          description="Verify inspection outcomes and report URLs."
        />
        <ActionCard
          to={`/${slug}/trips`}
          icon={Plane}
          title="Visa parameters"
          description="Update business-trip visa status."
        />
        <ActionCard
          to={`/${slug}/supports`}
          icon={LifeBuoy}
          title="Support tickets"
          description="Resolve or close buyer issues."
        />
      </div>
    </div>
  );
}

function BusinessIntelligenceHub() {
  const { user } = useDashboard();
  const stats = useLiveDashboardStats();
  const slug = ROLE_SLUG.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence Hub"
        description={`Live totals from the Yosti API for ${user.full_name || user.email}. Values come from each resource list meta.total.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Users"
          value={stats.loading ? "…" : formatStat(stats.users)}
          hint={formatStatHint(stats.users, "GET /users")}
          icon={Users}
        />
        <StatCard
          title="Payments"
          value={stats.loading ? "…" : formatStat(stats.payments)}
          hint={formatStatHint(stats.payments, "GET /payments")}
          icon={Wallet}
        />
        <StatCard
          title="Shipments"
          value={stats.loading ? "…" : formatStat(stats.shipments)}
          hint={formatStatHint(stats.shipments, "GET /shipments")}
          icon={Truck}
        />
        <StatCard
          title="Requests"
          value={stats.loading ? "…" : formatStat(stats.requests)}
          hint={formatStatHint(stats.requests, "GET /requests")}
          icon={FileText}
        />
        <StatCard
          title="Services"
          value={stats.loading ? "…" : formatStat(stats.services)}
          hint={formatStatHint(stats.services, "GET /services")}
          icon={Package}
        />
        <StatCard
          title="Support"
          value={stats.loading ? "…" : formatStat(stats.supports)}
          hint={formatStatHint(stats.supports, "GET /supports")}
          icon={LifeBuoy}
        />
        <StatCard
          title="Projects"
          value={stats.loading ? "…" : formatStat(stats.projects)}
          hint={formatStatHint(stats.projects, "GET /projects")}
          icon={FileCheck}
        />
        <StatCard
          title="Contacts"
          value={stats.loading ? "…" : formatStat(stats.contacts)}
          hint={formatStatHint(stats.contacts, "GET /contacts")}
          icon={Users}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#0F3952]">
          All role dashboards
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ActionCard
            to="/superadmin/dashboard"
            icon={Users}
            title="System Admin"
            description="Business intelligence and master controls."
          />
          <ActionCard
            to="/staff/dashboard"
            icon={FileCheck}
            title="Yosti Staff"
            description="Verification, sourcing, and operations."
          />
          <ActionCard
            to="/buyer/dashboard"
            icon={Package}
            title="Buyer"
            description="Sourcing, cargo, inspections, and payments."
          />
          <ActionCard
            to="/supplier/dashboard"
            icon={FileText}
            title="Supplier"
            description="Onboarding, RFQs, and inspections."
          />
          <ActionCard
            to="/logistics/dashboard"
            icon={Truck}
            title="Logistics"
            description="Bookings, status updates, and documents."
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          to={`/${slug}/users`}
          icon={Users}
          title="User Account Management"
          description="Live user directory with search and pagination."
        />
        <ActionCard
          to={`/${slug}/verifications`}
          icon={FileCheck}
          title="Supplier Verification Queue"
          description="No dedicated verification API is published yet."
        />
        <ActionCard
          to={`/${slug}/sourcing`}
          icon={FileText}
          title="Requests Management"
          description="Search and page live sourcing requests by region and deadline."
        />
        <ActionCard
          to={`/${slug}/quality-control`}
          icon={ClipboardCheck}
          title="Quality reports"
          description="Live inspection requests from the API."
        />
        <ActionCard
          to={`/${slug}/trips`}
          icon={Plane}
          title="Visa parameters"
          description="Live business-trip records."
        />
        <ActionCard
          to={`/${slug}/supports`}
          icon={LifeBuoy}
          title="Support tickets"
          description="Live support tickets from /api/supports."
        />
      </div>
    </div>
  );
}
