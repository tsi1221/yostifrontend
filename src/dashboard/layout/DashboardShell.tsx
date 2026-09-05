import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { clearAuthSession } from "../auth";
import { ROLE_LABEL, getNavigation } from "../roles";
import { useDashboard } from "../store";
import type { UserRole } from "../types";

interface DashboardShellProps {
  role: UserRole;
  children: ReactNode;
}

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, snapshot } = useDashboard();
  const alerts =
    snapshot.support_requests.filter((row) => row.status === "open").length +
    snapshot.verifications.filter((row) => row.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`flex min-h-screen flex-col ${collapsed ? "lg:pl-20" : "lg:pl-[280px]"}`}>
        <TopBar
          role={role}
          userName={user.full_name}
          alerts={alerts}
          onMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function TopBar({
  role,
  userName,
  alerts,
  onMenu,
}: {
  role: UserRole;
  userName: string;
  alerts: number;
  onMenu: () => void;
}) {
  const navigate = useNavigate();

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600">
          <Bell size={18} />
          {alerts > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#FDC700]" />
          ) : null}
        </span>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{userName}</p>
          <p className="text-xs font-medium text-[#0F3952]">{ROLE_LABEL[role]}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function Sidebar({
  role,
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
}: {
  role: UserRole;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const location = useLocation();
  const groups = getNavigation(role);
  const [openGroup, setOpenGroup] = useState<string | null>(groups[1]?.label ?? null);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onMobileClose}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F3952] text-white transition-all
          ${collapsed ? "w-20" : "w-[280px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-[72px] items-center justify-between px-4">
          <div className={collapsed ? "hidden" : "block"}>
            <p className="text-lg font-bold text-[#FDC700]">Yosti</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">
              Management portal
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={onMobileClose}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => {
            const Icon = group.icon;

            if (group.path) {
              return (
                <NavLink
                  key={group.label}
                  to={group.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-white/10 text-[#FDC700]"
                        : "text-white/80 hover:bg-white/5"
                    }`
                  }
                >
                  <Icon size={18} />
                  {collapsed ? null : group.label}
                </NavLink>
              );
            }

            const childActive = group.children?.some((child) =>
              location.pathname.startsWith(child.path)
            );
            const expanded = openGroup === group.label || childActive;

            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroup(expanded ? null : group.label)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    childActive ? "text-[#FDC700]" : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon size={18} />
                  {collapsed ? null : (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition ${expanded ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>
                {!collapsed && expanded
                  ? group.children?.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onMobileClose}
                        className={({ isActive }) =>
                          `ml-8 mt-1 block rounded-lg px-3 py-2 text-sm ${
                            isActive
                              ? "bg-[#FDC700] font-semibold text-[#0F3952]"
                              : "text-white/70 hover:bg-white/5"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))
                  : null}
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          className="m-3 hidden rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5 lg:flex lg:justify-center"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
}
