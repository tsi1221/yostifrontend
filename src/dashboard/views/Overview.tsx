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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ActionCard from "../components/ActionCard";
import ChartCard from "../components/ChartCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { ROLE_LABEL, ROLE_SLUG } from "../roles";
import {
  findUserName,
  useDashboard,
  useScopedRecords,
} from "../store";
import { DASHBOARD_GOLD, DASHBOARD_NAVY } from "../theme";
import type { DashboardSnapshot } from "../types";

const TOP_EXPORTS = [
  { name: "Coffee", tokens: ["coffee"] },
  { name: "Oilseeds", tokens: ["sesame", "oilseed", "gum arabic"] },
  { name: "Electronics", tokens: ["phone", "inverter", "electronic"] },
] as const;

function topExportData(snapshot: DashboardSnapshot) {
  return TOP_EXPORTS.map((group) => {
    const count = snapshot.country_products.reduce((sum, row) => {
      const categoryHit = row.export_categories.some((category) =>
        category.toLowerCase().includes(group.name.toLowerCase())
      )
        ? 1
        : 0;
      const productHits = row.export_products.filter((product) =>
        group.tokens.some((token) => product.toLowerCase().includes(token))
      ).length;
      return sum + categoryHit + productHits;
    }, 0);
    return { name: group.name, count };
  });
}

function shipmentPipeline(records: ReturnType<typeof useScopedRecords>) {
  return [
    { name: "Booked", count: records.shipments.filter((row) => row.status === "booked").length },
    { name: "Transit", count: records.shipments.filter((row) => row.status === "in transit").length },
    { name: "Port", count: records.shipments.filter((row) => row.status === "at port").length },
    { name: "Customs", count: records.shipments.filter((row) => row.status === "customs").length },
    { name: "Delivered", count: records.shipments.filter((row) => row.status === "delivered").length },
  ];
}

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
        {description} Signed in as {user.full_name}, {user.company_name}.
      </p>
    </section>
  );
}

function PipelineChart({ data }: { data: Array<{ name: string; count: number }> }) {
  return (
    <ChartCard title="Shipment pipeline">
      <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={index % 2 === 0 ? DASHBOARD_NAVY : DASHBOARD_GOLD}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ActivityFeed() {
  const { snapshot } = useDashboard();
  const { activity } = useScopedRecords();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-[#0F3952]">Recent activity</h2>
      <ul className="space-y-4">
        {activity.slice(0, 6).map((item) => (
          <li key={item.log_id} className="border-l-2 border-[#FDC700] pl-3">
            <p className="text-sm font-semibold text-slate-800">{item.action}</p>
            <p className="text-xs text-slate-500">
              {findUserName(snapshot, item.actor_id)} · {item.entity}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuyerWorkspace() {
  const { role } = useDashboard();
  const records = useScopedRecords();
  const slug = ROLE_SLUG[role];
  const pendingPay = records.payments.filter((row) => row.status === "pending").length;
  const paid = records.payments
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Buyer workspace"
        description="Submit sourcing, track cargo, book inspections, and settle invoices."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My RFQs"
          value={String(records.sourcing.length)}
          hint={`${records.sourcing.filter((row) => row.status === "open").length} open`}
          icon={Package}
        />
        <StatCard
          title="Shipments"
          value={String(records.shipments.length)}
          hint="Cargo tracking"
          icon={Truck}
        />
        <StatCard
          title="Inspections"
          value={String(records.inspections.length)}
          hint={`${records.inspections.filter((row) => row.status === "pending").length} pending`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Collected"
          value={`$${paid.toLocaleString()}`}
          hint={`${pendingPay} invoices waiting`}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          to={`/${slug}/sourcing`}
          icon={Package}
          title="Submit Sourcing Request"
          description="Capture product, quantity, target price, region, and deadline."
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
          description="Pay service fees from the Pay Now drawer."
          hint={pendingPay ? `${pendingPay} due` : "All settled"}
        />
        <ActionCard
          to={`/${slug}/supports`}
          icon={LifeBuoy}
          title="Support requests"
          description="Open defect, damage, or missing-item tickets."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <PipelineChart data={shipmentPipeline(records)} />
        <ActivityFeed />
      </div>
    </div>
  );
}

function SupplierWorkspace() {
  const { snapshot, role } = useDashboard();
  const records = useScopedRecords();
  const slug = ROLE_SLUG[role];
  const verification = snapshot.verifications.find(
    (row) => row.supplier_id === records.supplier?.supplier_id
  );

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Factory workspace"
        description="Complete onboarding, quote open RFQs, and keep inspection windows."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Onboarding verification
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F3952]">
              {records.supplier?.name ?? "No factory profile"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {verification?.turnaround_time} · {verification?.concerns}
            </p>
          </div>
          <StatusBadge value={verification?.status ?? "pending"} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Open RFQs"
          value={String(records.sourcing.filter((row) => row.status !== "completed").length)}
          hint="Visible to this factory"
          icon={FileText}
        />
        <StatCard
          title="My quotes"
          value={String(records.quotes.length)}
          hint="Submitted price / MOQ / lead time"
          icon={Package}
        />
        <StatCard
          title="Inspections"
          value={String(records.inspections.length)}
          hint="Assigned factory windows"
          icon={ClipboardCheck}
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
          description="Click Submit Quote to send price, MOQ, and lead time."
        />
        <ActionCard
          to={`/${slug}/quality-control`}
          icon={ClipboardCheck}
          title="Assigned Inspections"
          description="Calendar of factory check windows."
        />
      </div>

      <ActivityFeed />
    </div>
  );
}

function LogisticsWorkspace() {
  const { role } = useDashboard();
  const records = useScopedRecords();
  const slug = ROLE_SLUG[role];
  const live = records.shipments.filter((row) => row.status !== "delivered").length;

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Cargo handler console"
        description="Incoming bookings, status transitions, and shipping-document uploads."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Bookings"
          value={String(records.shipments.length)}
          hint={`${live} still in pipeline`}
          icon={Truck}
        />
        <StatCard
          title="In transit"
          value={String(records.shipments.filter((row) => row.status === "in transit").length)}
          hint="Sea / air / express"
          icon={Package}
        />
        <StatCard
          title="At port / customs"
          value={String(
            records.shipments.filter(
              (row) => row.status === "at port" || row.status === "customs"
            ).length
          )}
          hint="Needs status update"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Support"
          value={String(records.support.filter((row) => row.status === "open").length)}
          hint="Open tickets"
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <PipelineChart data={shipmentPipeline(records)} />
        <ActivityFeed />
      </div>
    </div>
  );
}

function StaffWorkspace() {
  const { snapshot, role } = useDashboard();
  const records = useScopedRecords();
  const slug = ROLE_SLUG[role];
  const pendingVerifications = snapshot.verifications.filter(
    (row) => row.status === "pending"
  ).length;
  const unassigned = snapshot.sourcing_requests.filter(
    (row) => row.status === "open" && row.assigned_supplier_ids.length === 0
  ).length;
  const openTickets = records.support.filter((row) => row.status === "open").length;
  const pendingVisas = records.trips.filter((row) => row.visa_status === "pending").length;

  return (
    <div className="space-y-6">
      <RoleBanner
        title="Yosti operations desk"
        description="Verify factories, dispatch RFQs, review QC reports, visas, and tickets."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pending factories"
          value={String(pendingVerifications)}
          hint="Verification queue"
          icon={FileCheck}
        />
        <StatCard
          title="Unassigned RFQs"
          value={String(unassigned)}
          hint="Need factory dispatch"
          icon={FileText}
        />
        <StatCard
          title="Visa files"
          value={String(pendingVisas)}
          hint="Awaiting decision"
          icon={Plane}
        />
        <StatCard
          title="Open tickets"
          value={String(openTickets)}
          hint="Client support"
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

      <ActivityFeed />
    </div>
  );
}

function BusinessIntelligenceHub() {
  const { snapshot, user } = useDashboard();
  const slug = ROLE_SLUG.SUPER_ADMIN;
  const destinationData = ["Ethiopia", "China", "Uganda", "South Sudan"].map(
    (country) => ({
      name: country,
      count: snapshot.shipments.filter((row) => row.destination_country === country)
        .length,
    })
  );
  const exportData = topExportData(snapshot);
  const paymentData = ["sourcing", "logistics", "inspection", "trip", "visa"].map(
    (service) => ({
      name: service,
      volume: snapshot.payments
        .filter((row) => row.service_type === service && row.status === "completed")
        .reduce((sum, row) => sum + row.amount, 0),
    })
  );
  const totalVolume = snapshot.payments
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence Hub"
        description={`Master controls for ${user.full_name}. Shipments by destination, top exports, and payment volume from the mock schema.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active accounts"
          value={String(snapshot.users.filter((row) => row.active).length)}
          hint={`${snapshot.users.length} total users`}
          icon={Users}
        />
        <StatCard
          title="Completed volume"
          value={`$${totalVolume.toLocaleString()}`}
          hint="Aggregate payments"
          icon={Wallet}
        />
        <StatCard
          title="Live shipments"
          value={String(
            snapshot.shipments.filter((row) => row.status !== "delivered").length
          )}
          hint="Not yet delivered"
          icon={Truck}
        />
        <StatCard
          title="Pending verifications"
          value={String(
            snapshot.verifications.filter((row) => row.status === "pending").length
          )}
          hint="Factory onboarding"
          icon={FileCheck}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard
          to={`/${slug}/users`}
          icon={Users}
          title="User Account Management"
          description="CRUD, authorization flags, and sub-role assignment."
        />
        <ActionCard
          to={`/${slug}/verifications`}
          icon={FileCheck}
          title="Supplier Verification Queue"
          description="Approve or reject factory onboarding."
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
          description="Resolve or close client tickets."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Shipments by Destination Country">
          <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
            <BarChart data={destinationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {destinationData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={index % 2 === 0 ? DASHBOARD_NAVY : DASHBOARD_GOLD}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Exports">
          <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
            <BarChart data={exportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={DASHBOARD_GOLD} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment volumes">
          <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
            <BarChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]} fill={DASHBOARD_NAVY} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#0F3952]">
          Country product lists
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.country_products.map((row) => (
            <article key={row.iso_code} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                {row.iso_code}
              </p>
              <h3 className="mt-1 font-semibold text-[#0F3952]">{row.country_name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {row.export_categories.join(" · ")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {row.export_products.join(", ")}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
