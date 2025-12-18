// src/pages/superAdmin/Dashboard.tsx
import  { type JSX } from "react";
import {
  UserOutlined,
  ShopOutlined,
  TruckOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

/* ==================== TYPES ==================== */
interface Action {
  label: string;
  path: string;
}

interface StatCardProps {
  icon: JSX.Element;
  title: string;
  value: string | number;
}

/* ==================== COMPONENT ==================== */
export default function Dashboard() {
  // Quick Actions
  const actions: Action[] = [
    { label: "Total Buyers", path: "/super-admin/buyers" },
    { label: "Suppliers", path: "/super-admin/suppliers" },
    { label: "Sourcing Requests", path: "/super-admin/sourcing" },
    { label: "Total Shipment Orders", path: "/super-admin/shipments" },
    { label: "Inspection Requests", path: "/super-admin/inspection" },
    { label: "Total Payments", path: "/super-admin/payments" },
    { label: "Business Trips Requests", path: "/super-admin/trips" },
    { label: "Support Requests", path: "/super-admin/support" },
  ];

  // Pie Chart Data
  const pieData: Record<string, any>[] = actions.map((a, i) => ({
    name: a.label,
    value: Math.floor(Math.random() * 40) + 5,
    color: [
      "#0284FF",
      "#FDBA21",
      "#FF4D4F",
      "#22C55E",
      "#8B5CF6",
      "#E11D48",
      "#0EA5E9",
      "#A855F7",
    ][i],
  }));

  // Bar Chart Data
  const barData: Record<string, any>[] = [
    { month: "Jan", shipments: 22 },
    { month: "Feb", shipments: 35 },
    { month: "Mar", shipments: 30 },
    { month: "Apr", shipments: 45 },
    { month: "May", shipments: 38 },
    { month: "Jun", shipments: 50 },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">System overview & administrative tools</p>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<UserOutlined />} title="Total Buyers" value="1,248" />
        <StatCard icon={<ShopOutlined />} title="Verified Suppliers" value="312" />
        <StatCard icon={<TruckOutlined />} title="Active Shipments" value="89" />
        <StatCard icon={<DollarOutlined />} title="Payments (This Month)" value="$72,450" />
      </div>

      {/* QUICK CONTROLS */}
      <h2 className="text-xl font-semibold mb-4">Quick Controls</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {actions.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="px-4 py-3 bg-[#0F3952] text-white border-2 border-yellow-400 rounded-lg shadow hover:bg-[#0d2f44] transition font-medium text-center block"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PIE CHART */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Control Activity Summary</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Tooltip />
              <Pie data={pieData} dataKey="value" outerRadius={120} label>
                {pieData.map((item, i) => (
                  <Cell key={i} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* MONTHLY SHIPMENTS BAR */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Shipments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="shipments" fill="#0284FF">
                <LabelList dataKey="shipments" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ==================== STAT CARD COMPONENT ==================== */
function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <div className="relative bg-white shadow rounded-xl p-6 flex items-center">
      <div className="absolute inset-y-0 left-0 w-2 bg-yellow-500 rounded-l-xl"></div>
      <div className="text-3xl text-gray-500 mr-4">{icon}</div>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}
