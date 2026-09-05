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
import StatusBadge from "../components/StatusBadge";
import {
  findUserName,
  getActivity,
  getInspections,
  getPayments,
  getSessionUser,
  getShipments,
  getSourcingRequests,
} from "../data";
import { ROLE_LABEL } from "../roles";
import type { UserRole } from "../types";
import { DASHBOARD_GOLD, DASHBOARD_NAVY } from "../theme";

export default function Overview({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const shipments = getShipments(role, user.id);
  const requests = getSourcingRequests(role, user.id);
  const inspections = getInspections(role, user.id);
  const payments = getPayments(role, user.id);
  const activity = getActivity(role, user.id);

  const paid = payments
    .filter((row) => row.status === "PAID")
    .reduce((sum, row) => sum + row.amount, 0);

  const chartData = [
    { name: "Pending", count: shipments.filter((row) => row.status === "PENDING").length },
    { name: "Transit", count: shipments.filter((row) => row.status === "IN_TRANSIT").length },
    { name: "Customs", count: shipments.filter((row) => row.status === "CUSTOMS").length },
    { name: "Delivered", count: shipments.filter((row) => row.status === "DELIVERED").length },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
          {ROLE_LABEL[role]}
        </p>
        <h1 className="mt-2 text-3xl font-bold">Good day, {user.fullName}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Live operations snapshot from isolated mock data. Swap `src/dashboard/mocks/data.ts`
          for API calls without changing these views.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Shipments"
          value={String(shipments.length)}
          hint="Visible to this role"
          icon={Truck}
        />
        <StatCard
          title="Sourcing RFQs"
          value={String(requests.length)}
          hint={`${requests.filter((row) => row.status === "OPEN").length} open`}
          icon={Package}
        />
        <StatCard
          title="Inspections"
          value={String(inspections.length)}
          hint={`${inspections.filter((row) => row.status === "PENDING").length} pending`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Collected"
          value={`$${paid.toLocaleString()}`}
          hint="Paid invoices"
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <ChartCard title="Shipment pipeline">
          <ResponsiveContainer width="100%" height="100%">
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
            {activity.map((item) => (
              <li key={item.id} className="border-l-2 border-[#FDC700] pl-3">
                <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                <p className="text-xs text-slate-500">
                  {findUserName(item.actorId)} · {item.entity}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#0F3952]">Active freight</h2>
        <ul className="space-y-3">
          {shipments.slice(0, 4).map((shipment) => (
            <li
              key={shipment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-[#0F3952]">{shipment.trackingNumber}</p>
                <p className="text-sm text-slate-500">
                  {shipment.origin} → {shipment.destination}
                </p>
              </div>
              <StatusBadge value={shipment.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
