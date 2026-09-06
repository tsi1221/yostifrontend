import  { type JSX } from "react";
import { useSupplierStore } from "../../VisitorPublicUser/store/useSupplierStore";
import {
  FileTextOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  
} from "recharts";

interface StatItem {
  key: string;
  title: string;
  icon: JSX.Element;
}

const statsData: StatItem[] = [
  { key: "totalRFQs", title: "Total RFQs Received", icon: <FileTextOutlined /> },
  { key: "pendingQuotes", title: "Pending Quotes", icon: <EditOutlined /> },
  { key: "activeOrders", title: "Active Orders", icon: <ShoppingCartOutlined /> },
  { key: "inspectionRequests", title: "Inspection Requests Pending", icon: <SearchOutlined /> },
];

const COLORS = ["#0088FE", "#FFBB28", "#FF4C4C"];

export default function DashboardSupplier() {
  const {
    totalRFQs,
    pendingQuotes,
    activeOrders,
    inspectionRequests,
    pieData,
    barData,
  } = useSupplierStore();

  // Ensure pieData has correct Recharts type
  const typedPieData: unknown[] = pieData.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  const statsMap: Record<string, number> = {
    totalRFQs,
    pendingQuotes,
    activeOrders,
    inspectionRequests,
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Supplier Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat) => (
          <div
            key={stat.key}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition cursor-pointer"
          >
            <div className="text-3xl text-gray-700 mb-2">{stat.icon}</div>
            <div className="text-sm font-medium text-gray-500">{stat.title}</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{statsMap[stat.key]}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-2xl p-4">
          <h2 className="text-lg font-semibold mb-2">Request Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {typedPieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-2xl p-4">
          <h2 className="text-lg font-semibold mb-2">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#0088FE" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
