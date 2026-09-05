import { ClipboardCheck, Package, Truck, Wallet } from "lucide-react";
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

import ChartCard from "../components/ChartCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { ROLE_LABEL } from "../roles";
import {
  findUserName,
  useDashboard,
  useScopedRecords,
} from "../store";
import { DASHBOARD_GOLD, DASHBOARD_NAVY } from "../theme";

export default function Overview() {
  const { snapshot, role, user } = useDashboard();
  const records = useScopedRecords();

  if (role === "SUPER_ADMIN") {
    return <BusinessIntelligenceHub />;
  }

  const paid = records.payments
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + row.amount, 0);

  const chartData = [
    { name: "Booked", count: records.shipments.filter((row) => row.status === "booked").length },
    { name: "Transit", count: records.shipments.filter((row) => row.status === "in transit").length },
    { name: "Port", count: records.shipments.filter((row) => row.status === "at port").length },
    { name: "Customs", count: records.shipments.filter((row) => row.status === "customs").length },
    { name: "Delivered", count: records.shipments.filter((row) => row.status === "delivered").length },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
          {ROLE_LABEL[role]}
        </p>
        <h1 className="mt-2 text-3xl font-bold">Good day, {user.full_name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Role-scoped workspace for {user.company_name}. Actions write into the isolated
          mock schema in `src/dashboard/mocks/data.ts`.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Shipments"
          value={String(records.shipments.length)}
          hint="Visible to this role"
          icon={Truck}
        />
        <StatCard
          title="Sourcing RFQs"
          value={String(records.sourcing.length)}
          hint={`${records.sourcing.filter((row) => row.status === "open").length} open`}
          icon={Package}
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
          hint="Completed invoices"
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <ChartCard title="Shipment pipeline">
          <ResponsiveContainer width="100%" height={240} minWidth={1} minHeight={1}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={index % 2 === 0 ? DASHBOARD_NAVY : DASHBOARD_GOLD}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#0F3952]">Recent activity</h2>
          <ul className="space-y-4">
            {records.activity.slice(0, 6).map((item) => (
              <li key={item.log_id} className="border-l-2 border-[#FDC700] pl-3">
                <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                <p className="text-xs text-slate-500">
                  {findUserName(snapshot, item.actor_id)} · {item.entity}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function BusinessIntelligenceHub() {
  const { snapshot, user } = useDashboard();

  const destinationData = ["Ethiopia", "China", "Uganda", "South Sudan"].map(
    (country) => ({
      name: country,
      count: snapshot.shipments.filter((row) => row.destination_country === country)
        .length,
    })
  );

  const categoryCount = new Map<string, number>();
  snapshot.country_products.forEach((row) => {
    row.export_categories.forEach((category) => {
      categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1);
    });
  });
  const exportData = ["Coffee", "Oilseeds", "Electronics"].map((name) => ({
    name,
    count: categoryCount.get(name) ?? 0,
  }));

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
        description={`Master controls for ${user.full_name}. Shipments, export mix, and payment volume from the live mock snapshot.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Active accounts"
          value={String(snapshot.users.filter((row) => row.active).length)}
          hint={`${snapshot.users.length} total users`}
          icon={Wallet}
        />
        <StatCard
          title="Completed volume"
          value={`$${totalVolume.toLocaleString()}`}
          hint="Aggregate payments"
          icon={Package}
        />
        <StatCard
          title="Live shipments"
          value={String(
            snapshot.shipments.filter((row) => row.status !== "delivered").length
          )}
          hint="Not yet delivered"
          icon={Truck}
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
