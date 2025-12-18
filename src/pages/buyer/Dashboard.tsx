// src/pages/buyer/Dashboard.tsx
import React from "react";

// ============================================
// ICONS
// ============================================
const TruckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l4-4 4 4 4-4 4 4M5 19v2a1 1 0 001 1h12a1 1 0 001-1v-2M10 20l4-4" />
  </svg>
);

const ClipboardListIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-9 0V3h4m-4 2h4m-4 2h4m-4 2h4m-4 2h4m-4 2h4M9 5a2 2 0 002 2h2a2 2 0 002-2V3a2 2 0 00-2-2h-2a2 2 0 00-2 2v2" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BellIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.939 13.939 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================
// DATA
// ============================================
const statData = [
  { title: "Open RFQs", value: 4, icon: ClipboardListIcon, bgColor: "bg-yellow-500/10" },
  { title: "Pending Quotes", value: 2, icon: ClockIcon, bgColor: "bg-blue-500/10" },
  { title: "Shipments In Transit", value: 1, icon: TruckIcon, bgColor: "bg-indigo-500/10" },
  { title: "New Notifications", value: 3, icon: BellIcon, bgColor: "bg-red-500/10" },
];

const rfqs = [
  { title: "RFQ #ELC-005: Electronics", status: "Pending Quote", statusColor: "text-blue-700 bg-blue-100" },
  { title: "RFQ #FUR-012: Furniture", status: "Under Review", statusColor: "text-yellow-700 bg-yellow-100" },
  { title: "RFQ #FAS-008: Fashion Items", status: "Quoted", statusColor: "text-green-700 bg-green-100" },
  { title: "RFQ #AUT-001: Automotive Parts", status: "Draft", statusColor: "text-gray-700 bg-gray-200" },
];

const shipments = [
  { title: "Shipment #CN-001 (In Transit)", status: "In Transit", statusColor: "text-indigo-700 bg-indigo-100" },
  { title: "Shipment #DE-002 (Delivered)", status: "Delivered", statusColor: "text-green-700 bg-green-100" },
  { title: "Shipment #UK-003 (Pickup Ready)", status: "Ready for Pickup", statusColor: "text-orange-700 bg-orange-100" },
  { title: "Shipment #US-004 (Customs)", status: "Customs Clearance", statusColor: "text-red-700 bg-red-100" },
  { title: "Shipment #AS-008 (Scheduled)", status: "Scheduled", statusColor: "text-gray-700 bg-gray-200" },
];

// TypeScript-corrected notifications array
interface NotificationProps {
  message: string;
  time: string;
  type?: "info" | "warning" | "success" | "new";
}

const notifications: NotificationProps[] = [
  { message: "Quote Received for <b>RFQ #FAS-008</b>", time: "Just now", type: "new" },
  { message: "<b>Shipment #CN-001</b> is delayed by 1 day", time: "1 hour ago", type: "warning" },
  { message: "Your account profile is <b>75% complete</b>", time: "Yesterday", type: "info" },
  { message: "Welcome to the platform! <b>Get started here</b>", time: "3 days ago", type: "info" },
  { message: "RFQ #ELC-005 processed successfully", time: "Today", type: "success" },
];

// ============================================
// COMPONENTS
// ============================================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.FC;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, bgColor = "bg-yellow-500/10" }) => (
  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-full ${bgColor}`}>
        <Icon />
      </div>
    </div>
    <h3 className="text-md text-gray-500 font-medium mb-1">{title}</h3>
    <p className="text-4xl font-bold text-[#0A1A4E]">{value}</p>
    <div className="mt-4 h-1 w-1/4 bg-yellow-500 rounded-full"></div>
  </div>
);

interface PanelItemProps {
  title: string;
  status: string;
  statusColor: string;
}

const PanelItem: React.FC<PanelItemProps> = ({ title, status, statusColor }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-100 last:border-b-0">
    <p className="font-medium text-gray-800 flex-1">{title}</p>
    <span className={`mt-1 sm:mt-0 text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
      {status}
    </span>
  </div>
);

const Notification: React.FC<NotificationProps> = ({ message, time, type = "info" }) => {
  const bgColor =
    type === "new"
      ? "bg-blue-50/50 border-blue-200"
      : type === "warning"
      ? "bg-yellow-50/50 border-yellow-200"
      : type === "success"
      ? "bg-green-50/50 border-green-200"
      : "bg-gray-50 border-gray-200";

  const textColor =
    type === "new"
      ? "text-blue-800"
      : type === "warning"
      ? "text-yellow-800"
      : type === "success"
      ? "text-green-800"
      : "text-gray-600";

  return (
    <div className={`p-4 rounded-xl border ${bgColor} hover:opacity-90 transition cursor-pointer`}>
      <p className={`font-medium ${textColor}`} dangerouslySetInnerHTML={{ __html: message }} />
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  );
};

// ============================================
// DASHBOARD COMPONENT
// ============================================
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1A4E] mb-1">Buyer Dashboard</h1>
          <p className="text-gray-600">Here's an overview of your current logistics activities</p>
        </div>
        <div className="relative">
          <UserIcon />
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 text-xs flex items-center justify-center p-2 transform translate-x-1 -translate-y-1">
            {notifications.length}
          </span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statData.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQs Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#0A1A4E]">Recent Sourcing Requests</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {rfqs.map((rfq, idx) => (
              <PanelItem key={idx} {...rfq} />
            ))}
          </div>
        </div>

        {/* Shipments Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#0A1A4E]">Shipments Overview</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Track All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {shipments.map((shipment, idx) => (
              <PanelItem key={idx} {...shipment} />
            ))}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#0A1A4E]">Notifications</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Mark All Read</button>
          </div>
          <div className="flex flex-col gap-4">
            {notifications.map((notif, idx) => (
              <Notification key={idx} {...notif} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
