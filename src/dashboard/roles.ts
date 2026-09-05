import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Newspaper,
  Package,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "./types";

export const ROLE_SLUG: Record<UserRole, string> = {
  SUPER_ADMIN: "superadmin",
  STAFF: "staff",
  BUYER: "buyer",
  SUPPLIER: "supplier",
  LOGISTICS_PARTNER: "logistics",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  STAFF: "Operations Staff",
  BUYER: "Buyer",
  SUPPLIER: "Supplier",
  LOGISTICS_PARTNER: "Logistics Partner",
};

export type DashboardPageKey =
  | "dashboard"
  | "users"
  | "sourcing"
  | "logistics"
  | "quality-control"
  | "trips"
  | "visa-invitations"
  | "payments"
  | "services"
  | "blogs"
  | "projects"
  | "contacts"
  | "files"
  | "supports";

export interface NavItem {
  key: DashboardPageKey;
  label: string;
  path: string;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: NavItem[];
}

const item = (
  slug: string,
  key: DashboardPageKey,
  label: string
): NavItem => ({
  key,
  label,
  path: `/${slug}/${key === "dashboard" ? "dashboard" : key}`,
});

export const getNavigation = (role: UserRole): NavGroup[] => {
  const slug = ROLE_SLUG[role];

  const dashboard: NavGroup = {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: `/${slug}/dashboard`,
  };

  const sourcing: NavGroup = {
    label: "Sourcing",
    icon: FileText,
    path: `/${slug}/sourcing`,
  };

  const logistics: NavGroup = {
    label: "Logistics & Operations",
    icon: Truck,
    children: [
      item(slug, "logistics", "Cargo & Tracking"),
      item(slug, "quality-control", "Quality Control"),
      item(slug, "trips", "Trips"),
    ],
  };

  const commercial: NavGroup = {
    label: "Commercial",
    icon: BriefcaseBusiness,
    children: [
      item(slug, "visa-invitations", "Visa Invitations"),
      item(slug, "payments", "Payments"),
      item(slug, "services", "Services"),
    ],
  };

  const content: NavGroup = {
    label: "Content",
    icon: Newspaper,
    children: [
      item(slug, "blogs", "Blogs"),
      item(slug, "projects", "Projects"),
    ],
  };

  const administration: NavGroup = {
    label: "Administration",
    icon: Users,
    children: [
      item(slug, "users", "Users"),
      item(slug, "contacts", "Contacts"),
      item(slug, "files", "Files"),
    ],
  };

  const support: NavGroup = {
    label: "Support",
    icon: LifeBuoy,
    children: [item(slug, "supports", "Support Tickets")],
  };

  const buyerOps: NavGroup = {
    label: "My Operations",
    icon: Package,
    children: [
      item(slug, "sourcing", "My Requests"),
      item(slug, "logistics", "My Shipments"),
      item(slug, "quality-control", "Inspections"),
      item(slug, "trips", "My Trips"),
    ],
  };

  switch (role) {
    case "SUPER_ADMIN":
      return [dashboard, sourcing, logistics, commercial, content, administration, support];
    case "STAFF":
      return [dashboard, sourcing, logistics, commercial, support];
    case "BUYER":
      return [dashboard, buyerOps, commercial, support];
    case "SUPPLIER":
      return [dashboard, sourcing, logistics, support];
    case "LOGISTICS_PARTNER":
      return [dashboard, logistics, support];
    default:
      return [dashboard];
  }
};

export const roleCanAccess = (role: UserRole, page: DashboardPageKey) => {
  const groups = getNavigation(role);
  return groups.some((group) => {
    if (group.path?.endsWith(`/${page}`) || (page === "dashboard" && group.path?.endsWith("/dashboard"))) {
      return true;
    }
    return group.children?.some((child) => child.key === page) ?? false;
  });
};
