import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { clearAuthSession } from "../auth";
import { useAuth } from "../auth/AuthProvider";
import { ROLE_LABEL, dashboardPath, filterNavigation, getNavigation } from "../roles";
import { useDashboard } from "../store";
import type { UserRole } from "../types";
import type { ContactRecord } from "../contacts/types";
import ContactNotificationMenu from "../contacts/ContactNotificationMenu";
import { useContactsList } from "../contacts/useContactsList";
import { useSeenContactNotifications } from "../contacts/useSeenContactNotifications";

interface DashboardShellProps {
  role: UserRole;
  children: ReactNode;
}

export default function DashboardShell({
  role,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useDashboard();
  const { ready, isAuthenticated } = useAuth();
  const contactNotificationsEnabled =
    ready && isAuthenticated && (role === "SUPER_ADMIN" || role === "STAFF");
  const contactsQuery = useContactsList({ enabled: contactNotificationsEnabled });
  const { seenIds, markSeen } = useSeenContactNotifications(user.id);
  const unseenContacts = useMemo(
    () =>
      contactsQuery.contacts.filter((contact) => {
        const contactId = Number(contact.id);
        return Number.isInteger(contactId) && contactId > 0 && !seenIds.has(contactId);
      }),
    [contactsQuery.contacts, seenIds],
  );
  const unseenContactCount = contactNotificationsEnabled ? unseenContacts.length : 0;
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        contactCount={unseenContactCount}
      />

      <div
        className={`flex min-h-screen flex-col ${collapsed ? "lg:pl-20" : "lg:pl-[280px]"}`}
      >
        <TopBar
          role={role}
          userName={user.full_name}
          userEmail={user.email}
          userCompany={user.company_name}
          contacts={unseenContacts}
          contactCount={unseenContactCount}
          contactsLoading={contactsQuery.loading}
          contactsError={contactsQuery.serverError}
          retryContacts={contactsQuery.retry}
          onContactSeen={markSeen}
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
  userEmail,
  userCompany,
  contacts,
  contactCount,
  contactsLoading,
  contactsError,
  retryContacts,
  onContactSeen,
  onMenu,
}: {
  role: UserRole;
  userName: string;
  userEmail: string;
  userCompany: string;
  contacts: ContactRecord[];
  contactCount: number;
  contactsLoading: boolean;
  contactsError: string | null;
  retryContacts: () => void;
  onContactSeen: (contactId: number) => void;
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
        {role === "SUPER_ADMIN" || role === "STAFF" ? (
          <ContactNotificationMenu
            contacts={contacts}
            contactCount={contactCount}
            loading={contactsLoading}
            serverError={contactsError}
            retry={retryContacts}
            onSeen={onContactSeen}
          />
        ) : null}
        <NavLink
          to={dashboardPath("profile")}
          className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-50"
          aria-label="Open profile"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="max-w-[240px] truncate text-xs font-medium text-[#0F3952]">
              {ROLE_LABEL[role]}
              {userCompany || userEmail ? ` · ${userCompany || userEmail}` : ""}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F3952] text-xs font-bold text-[#FDC700]">
            {userName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("") || "Y"}
          </span>
        </NavLink>
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
  contactCount,
}: {
  role: UserRole;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  contactCount: number;
}) {
  const location = useLocation();
  const { canAccessPage } = useAuth();
  const groups = filterNavigation(getNavigation(role), canAccessPage);
  const [openGroup, setOpenGroup] = useState<string | null>(
    groups[1]?.label ?? null,
  );

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
              location.pathname.startsWith(child.path),
            );
            const expanded = openGroup === group.label || childActive;

            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(expanded ? null : group.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    childActive
                      ? "text-[#FDC700]"
                      : "text-white/80 hover:bg-white/5"
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
                        <span className="flex items-center justify-between gap-2">
                          <span>{child.label}</span>
                          {child.key === "contacts" && contactCount > 0 ? (
                            <span
                              className="min-w-5 rounded-full bg-[#FDC700] px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-[#0F3952]"
                              aria-label={`${contactCount} contact submissions`}
                            >
                              {contactCount > 99 ? "99+" : contactCount}
                            </span>
                          ) : null}
                        </span>
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
