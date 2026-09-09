import type { LucideIcon } from "lucide-react";
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

import { useAuth } from "../auth/AuthProvider";
import type { ResourceAccess } from "../auth/access";
import ActionCard from "../components/ActionCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import type { DashboardPageKey } from "../roles";
import { ROLE_LABEL, dashboardPath } from "../roles";
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

function VisibleStat({
  loading,
  stat,
  title,
  okHint,
  icon,
}: {
  loading: boolean;
  stat: ResourceAccess;
  title: string;
  okHint: string;
  icon: LucideIcon;
}) {
  if (!loading && stat.forbidden) {
    return null;
  }

  return (
    <StatCard
      title={title}
      value={loading ? "…" : formatStat(stat)}
      hint={loading ? "Loading" : formatStatHint(stat, okHint)}
      icon={icon}
    />
  );
}

function VisibleAction({
  page,
  to,
  icon,
  title,
  description,
}: {
  page: DashboardPageKey;
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  const { canAccessPage } = useAuth();
  if (!canAccessPage(page)) {
    return null;
  }
  return (
    <ActionCard to={to} icon={icon} title={title} description={description} />
  );
}

function BuyerWorkspace() {
  const stats = useLiveDashboardStats();

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Buyer workspace"
        description="Submit sourcing, track cargo, book inspections, and settle invoices."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VisibleStat
          loading={stats.loading}
          stat={stats.requests}
          title="My RFQs"
          okHint="Open sourcing requests"
          icon={Package}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.shipments}
          title="Shipments"
          okHint="Cargo tracking"
          icon={Truck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.inspections}
          title="Inspections"
          okHint="Quality bookings"
          icon={ClipboardCheck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.payments}
          title="Payments"
          okHint="Invoice records"
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <VisibleAction
          page="sourcing"
          to={dashboardPath("sourcing")}
          icon={Package}
          title="Submit Sourcing Request"
          description="Create and review sourcing requests."
        />
        <VisibleAction
          page="logistics"
          to={dashboardPath("logistics")}
          icon={Truck}
          title="Cargo Tracking System"
          description="Follow active shipments from booking to delivery."
        />
        <VisibleAction
          page="quality-control"
          to={dashboardPath("quality-control")}
          icon={ClipboardCheck}
          title="Request Quality Inspection"
          description="Book sample, pre-shipment, or factory-visit checks."
        />
        <VisibleAction
          page="trips"
          to={dashboardPath("trips")}
          icon={Plane}
          title="Submit Visa / Business Trip"
          description="Arrival city, passport, hotel, and translator."
        />
        <VisibleAction
          page="payments"
          to={dashboardPath("payments")}
          icon={Wallet}
          title="Payments & Invoices"
          description="Review payment records."
        />
        <VisibleAction
          page="supports"
          to={dashboardPath("supports")}
          icon={LifeBuoy}
          title="Support requests"
          description="Open defect, damage, or missing-item tickets."
        />
      </div>
    </div>
  );
}

function SupplierWorkspace() {
  const stats = useLiveDashboardStats();

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Factory workspace"
        description="Quote open RFQs and keep inspection windows."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <VisibleStat
          loading={stats.loading}
          stat={stats.requests}
          title="Open RFQs"
          okHint="Open sourcing requests"
          icon={FileText}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.inspections}
          title="Inspections"
          okHint="Assigned factory windows"
          icon={ClipboardCheck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.supports}
          title="Support"
          okHint="Open tickets"
          icon={LifeBuoy}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <VisibleAction
          page="verifications"
          to={dashboardPath("verifications")}
          icon={FileCheck}
          title="Onboarding Verification"
          description="Company profile and onboarding status."
        />
        <VisibleAction
          page="sourcing"
          to={dashboardPath("sourcing")}
          icon={FileText}
          title="Open RFQs"
          description="Review sourcing requests."
        />
        <VisibleAction
          page="quality-control"
          to={dashboardPath("quality-control")}
          icon={ClipboardCheck}
          title="Assigned Inspections"
          description="Calendar of factory check windows."
        />
      </div>
    </div>
  );
}

function LogisticsWorkspace() {
  const stats = useLiveDashboardStats();

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Cargo handler console"
        description="Incoming bookings, status transitions, and shipping-document uploads."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VisibleStat
          loading={stats.loading}
          stat={stats.shipments}
          title="Bookings"
          okHint="Cargo records"
          icon={Truck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.requests}
          title="Requests"
          okHint="Sourcing volume"
          icon={Package}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.inspections}
          title="Inspections"
          okHint="Quality bookings"
          icon={ClipboardCheck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.supports}
          title="Support"
          okHint="Open tickets"
          icon={LifeBuoy}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <VisibleAction
          page="logistics"
          to={dashboardPath("logistics")}
          icon={Truck}
          title="Shipment Bookings"
          description="Update cargo status and attach shipping documents."
        />
        <VisibleAction
          page="supports"
          to={dashboardPath("supports")}
          icon={LifeBuoy}
          title="Support"
          description="Buyer issues tied to tracking numbers."
        />
      </div>
    </div>
  );
}

function StaffWorkspace() {
  const stats = useLiveDashboardStats();

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Yosti operations desk"
        description="Dispatch RFQs, review QC reports, visas, and tickets."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VisibleStat
          loading={stats.loading}
          stat={stats.requests}
          title="Requests"
          okHint="Sourcing volume"
          icon={FileText}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.users}
          title="Users"
          okHint="Directory"
          icon={Users}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.trips}
          title="Visa files"
          okHint="Business trips"
          icon={Plane}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.supports}
          title="Open tickets"
          okHint="Client support"
          icon={LifeBuoy}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <VisibleAction
          page="verifications"
          to={dashboardPath("verifications")}
          icon={FileCheck}
          title="Supplier Verification Queue"
          description="Review profiles and approve or reject onboarding."
        />
        <VisibleAction
          page="sourcing"
          to={dashboardPath("sourcing")}
          icon={FileText}
          title="Sourcing Assignment Board"
          description="Dispatch open RFQs to qualified factories."
        />
        <VisibleAction
          page="quality-control"
          to={dashboardPath("quality-control")}
          icon={ClipboardCheck}
          title="Quality reports"
          description="Verify inspection outcomes."
        />
        <VisibleAction
          page="trips"
          to={dashboardPath("trips")}
          icon={Plane}
          title="Visa parameters"
          description="Update business-trip visa status."
        />
        <VisibleAction
          page="supports"
          to={dashboardPath("supports")}
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence Hub"
        description={`Welcome back, ${user.full_name || user.email}. Totals below reflect live records you can access.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VisibleStat
          loading={stats.loading}
          stat={stats.users}
          title="Users"
          okHint="Registered accounts"
          icon={Users}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.payments}
          title="Payments"
          okHint="Payment records"
          icon={Wallet}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.shipments}
          title="Shipments"
          okHint="Cargo bookings"
          icon={Truck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.requests}
          title="Requests"
          okHint="Sourcing requests"
          icon={FileText}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.services}
          title="Services"
          okHint="Published services"
          icon={Package}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.supports}
          title="Support"
          okHint="Support tickets"
          icon={LifeBuoy}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.projects}
          title="Projects"
          okHint="Project records"
          icon={FileCheck}
        />
        <VisibleStat
          loading={stats.loading}
          stat={stats.contacts}
          title="Contacts"
          okHint="Inbox messages"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <VisibleAction
          page="users"
          to={dashboardPath("users")}
          icon={Users}
          title="User Account Management"
          description="Search and page through registered accounts."
        />
        <VisibleAction
          page="payments"
          to={dashboardPath("payments")}
          icon={Wallet}
          title="Payments"
          description="Review payment and invoice records."
        />
        <VisibleAction
          page="sourcing"
          to={dashboardPath("sourcing")}
          icon={FileText}
          title="Requests Management"
          description="Search sourcing requests by region and deadline."
        />
        <VisibleAction
          page="logistics"
          to={dashboardPath("logistics")}
          icon={Truck}
          title="Shipments"
          description="Track cargo bookings and status updates."
        />
        <VisibleAction
          page="quality-control"
          to={dashboardPath("quality-control")}
          icon={ClipboardCheck}
          title="Quality reports"
          description="Review inspection requests and outcomes."
        />
        <VisibleAction
          page="supports"
          to={dashboardPath("supports")}
          icon={LifeBuoy}
          title="Support tickets"
          description="Review and close client support tickets."
        />
      </div>
    </div>
  );
}
