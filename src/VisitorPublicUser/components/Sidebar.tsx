// src/components/Sidebar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  AppstoreOutlined,
  AppstoreAddOutlined,
  CustomerServiceOutlined,
  TruckOutlined,
  SafetyOutlined,
  DollarCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  MenuFoldOutlined,IdcardOutlined,GlobalOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import yostiLogo from "../assets/yostilogo.png";
import type { JSX } from "react/jsx-runtime";

export type Role =
  | "admin"
  | "super-admin"
  | "supplier"
  | "buyer"
  | "student"
  | "logistics";

interface SidebarProps {
  role: Role;
}

interface MenuItem {
  key: string;
  label: string;
  icon: JSX.Element;
  path?: string;
  children?: MenuItem[];
}

const menuItemsByRole: Record<Role, MenuItem[]> = {
  buyer: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/buyer/dashboard" },
    // { key: "my-requests", label: "My Requests", icon: <AppstoreOutlined />, path: "/requests" },
    { key: "my-shipments", label: "My Shipments", icon: <TruckOutlined />, path: "/shipments" },
    { key: "my-inspections", label: "My Inspections", icon: <SafetyOutlined />, path: "/buyerinspection" },
  
    { key: "my-payments", label: "My Payments", icon: <DollarCircleOutlined />, path: "/payments" },
      { key: "my-trips", label: "My Trips", icon: <GlobalOutlined/>, path: "/trips" },
    { key: "support", label: "Support", icon: <CustomerServiceOutlined />, path: "/support" },
    { key: "my-visa", label: "My Visa Invitations", icon: <IdcardOutlined/>, path: "/visa" },
    { key: "blog", label: "Blog & News", icon: <FileTextOutlined />, path: "/blog/news" },
    { key: "export-products", label: "Export Products", icon: <AppstoreAddOutlined />, path: "/industries" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/profile" },
    { key: "logout", label: "Logout", icon: <AppstoreOutlined />, path: "/" },
  ],
  supplier: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/supplier/dashboard" },
    { key: "my-quotes", label: "Quotes", icon: <AppstoreAddOutlined />, path: "/my-quotes" },
    { key: "my-inspections", label: "Inspections", icon: <SafetyOutlined />, path: "/my-inspections" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/profile" },
    { key: "verification-status", label: "Verification", icon: <CustomerServiceOutlined />, path: "/verification-status" },
    { key: "logout", label: "Logout", icon: <AppstoreOutlined />, path: "/" },
  ],
  student: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/student/dashboard" },
    { key: "communication", label: "Communicate with Staff/Admin", icon: <CustomerServiceOutlined />, path: "/communication" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/profile" },
    { key: "logout", label: "Logout", icon: <AppstoreOutlined />, path: "/" },
  ],
  logistics: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/logistics/dashboard" },
    { key: "all-shipments", label: "All Shipments", icon: <TruckOutlined />, path: "/shipmentsorder" },
    { key: "new-booking", label: "New Booking", icon: <AppstoreAddOutlined />, path: "/new-booking" },
    { key: "coordination", label: "Coordination with Yosti", icon: <CustomerServiceOutlined />, path: "/coordination" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/profile" },
    { key: "logout", label: "Logout", icon: <AppstoreOutlined />, path: "/" },
  ],
  admin: [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/admin/dashboard" },
    { key: "sourcing", label: "Sourcing", icon: <AppstoreOutlined />, path: "/sourcing" },
    { key: "shipments", label: "Shipments", icon: <TruckOutlined />, path: "/shipments" },
    { key: "inspections", label: "Inspections", icon: <SafetyOutlined />, path: "/inspections" },

     { key: "trips", label: "Trip", icon: <GlobalOutlined />, path: "/trips" },
     { key: "visa", label: "Visa", icon: <IdcardOutlined />, path: "/visaADMIN" },

     { key: "support", label: "Support", icon: <CustomerServiceOutlined />, path: "/support" },
     { key: "blogs", label: "Blog & Testimony", icon: <AppstoreAddOutlined />, path: "/blogs" },
    { key: "payments", label: "Payments", icon: <DollarCircleOutlined />, path: "/payments" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/profile" },
    { key: "logout", label: "Logout", icon: <AppstoreOutlined />, path: "/" },
  ],
  "super-admin": [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/superadmin/dashboard" },
    { key: "sourcing", label: "Sourcing Requests", icon: <AppstoreOutlined />, path: "/allsourcing" },
    { key: "supplier-quotes", label: "Supplier Quotes", icon: <AppstoreAddOutlined />, path: "/allquotes" },
    { key: "suppliers", label: "Suppliers (Verify)", icon: <SafetyOutlined />, path: "/allsuppliers" },
    { key: "shipments", label: "Shipments", icon: <TruckOutlined />, path: "/allshipments" },
    { key: "inspections", label: "Inspections", icon: <SafetyOutlined />, path: "/allinspections" },
    { key: "business-trips", label: "Business Trips & Visa", icon: <TruckOutlined />, path: "/alltrips" },
    { key: "payments", label: "Payments", icon: <DollarCircleOutlined />, path: "/allpayments" },
    { key: "support-tickets", label: "Support Tickets", icon: <CustomerServiceOutlined />, path: "/all-support-tickets" },
    { key: "export-products", label: "Export Products", icon: <AppstoreAddOutlined />, path: "/all-port-Products" },
    { key: "blog", label: "Blog & News", icon: <FileTextOutlined />, path: "/allblogs" },
    { key: "testimonials", label: "Testimonials", icon: <FileTextOutlined />, path: "/alltestimonials" },
    { key: "users", label: "Users (All Roles)", icon: <UserOutlined />, path: "/allusers" },
    { key: "staff-management", label: "Staff Management", icon: <UserOutlined />, path: "/staff-management" },
      { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/profile" },
    { key: "settings", label: "Settings", icon: <CustomerServiceOutlined />, path: "/settings" },
    { key: "logout", label: "Logout", icon: <AppstoreOutlined />, path: "/" },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [selectedKey, setSelectedKey] = useState<string>("dashboard");
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const renderMenuItem = (item: MenuItem, depth = 0) => (
    <div key={item.key}>
      <button
        onClick={() => {
          setSelectedKey(item.key);
          if (item.path) navigate(item.path);
        }}
        className={`flex items-center w-full py-2 px-4 rounded-lg transition-all cursor-pointer ${
          selectedKey === item.key ? "font-semibold bg-white/20" : "hover:bg-white/10"
        }`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        <span className="mr-3 text-lg">{item.icon}</span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </button>
      {item.children?.map((child) => renderMenuItem(child, depth + 1))}
    </div>
  );

  return (
    <aside
      className="flex flex-col bg-[#0F3952] text-white transition-all duration-300"
      style={{ width: collapsed ? "80px" : "250px", height: "100vh" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-start py-4 px-4 border-b border-gray-700 select-none cursor-default gap-2">
        <img
          src={yostiLogo}
          alt="Yosti Logo"
          className={`${collapsed ? "h-6" : "h-12"} transition-all`}
        />
        {!collapsed && (
          <span className="text-xl font-bold">
            <span className="text-white">Y</span>
            <span style={{ color: "#E4BD3B" }}>osti</span>
          </span>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto mt-1" style={{ scrollbarWidth: "none" }}>
        {menuItemsByRole[role]?.map((item) => renderMenuItem(item))}
      </div>

      {/* Collapse Button */}
      <div className="border-t border-gray-700 p-2 flex justify-center">
        <button onClick={toggleSidebar} className="text-white text-lg focus:outline-none">
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      <style>{`
        div::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
