// src/shared/layout/DashboardLayout.tsx

import { useState, type ReactNode } from "react";
import Sidebar, { type UserRole } from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    // Connect real authentication clearing logic here
    console.log("Logout triggered");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`
          flex min-h-screen flex-col
          transition-all duration-300 ease-out
          ${collapsed ? "lg:pl-[80px]" : "lg:pl-[280px]"}
        `}
      >
        <Header
          role={role}
          onMobileMenuToggle={() => setMobileOpen((prev) => !prev)}
          onLogout={handleLogout}
          hasNotifications={true}
        />

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}