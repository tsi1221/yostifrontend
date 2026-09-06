import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileCheck,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Truck,
  UserRound,
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
  SUPER_ADMIN: "System Admin",
  STAFF: "Yosti Staff",
  BUYER: "Customer / Buyer",
  SUPPLIER: "Supplier / Factory",
  LOGISTICS_PARTNER: "Logistics Partner",
};

export type DashboardPageKey =
  | "dashboard"
  | "users"
  | "verifications"
  | "sourcing"
  | "logistics"
  | "quality-control"
  | "trips"
  | "payments"
  | "services"
  | "supports"
  | "blogs"
  | "projects"
  | "contacts"
  | "files"
  | "roles"
  | "permissions"
  | "profile";

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
    label: role === "SUPER_ADMIN" ? "Business Intelligence" : "Dashboard",
    icon: LayoutDashboard,
    path: `/${slug}/dashboard`,
  };

  const profile: NavGroup = {
    label: "Profile",
    icon: UserRound,
    path: `/${slug}/profile`,
  };

  switch (role) {
    case "SUPER_ADMIN":
      return [
        dashboard,
        {
          label: "Accounts",
          icon: Users,
          children: [
            item(slug, "users", "User Account Management"),
            item(slug, "roles", "Roles"),
            item(slug, "permissions", "Permissions"),
          ],
        },
        {
          label: "Operations",
          icon: BriefcaseBusiness,
          children: [
            item(slug, "verifications", "Supplier Verifications"),
            item(slug, "sourcing", "Requests Management"),
            item(slug, "logistics", "Shipments"),
            item(slug, "quality-control", "Quality Reports"),
            item(slug, "trips", "Visa Parameters"),
            item(slug, "services", "Services"),
            item(slug, "supports", "Support Tickets"),
            item(slug, "blogs", "Blogs"),
            item(slug, "projects", "Projects"),
            item(slug, "contacts", "Contacts"),
            item(slug, "files", "Files"),
          ],
        },
        profile,
      ];
    case "STAFF":
      return [
        dashboard,
        {
          label: "Factory desk",
          icon: FileCheck,
          path: `/${slug}/verifications`,
        },
        {
          label: "Sourcing board",
          icon: FileText,
          path: `/${slug}/sourcing`,
        },
        {
          label: "Operations",
          icon: BriefcaseBusiness,
          children: [
            item(slug, "quality-control", "Quality Reports"),
            item(slug, "trips", "Visa Parameters"),
            item(slug, "services", "Services"),
            item(slug, "supports", "Support Tickets"),
            item(slug, "blogs", "Blogs"),
            item(slug, "projects", "Projects"),
            item(slug, "contacts", "Contacts"),
            item(slug, "files", "Files"),
          ],
        },
        profile,
      ];
    case "BUYER":
      return [
        dashboard,
        {
          label: "Trade actions",
          icon: Package,
          children: [
            item(slug, "sourcing", "Submit Sourcing Request"),
            item(slug, "logistics", "Cargo Tracking System"),
            item(slug, "quality-control", "Request Quality Inspection"),
            item(slug, "trips", "Visa / Business Trip"),
            item(slug, "services", "Services"),
          ],
        },
        {
          label: "Payments & Invoices",
          icon: BriefcaseBusiness,
          path: `/${slug}/payments`,
        },
        {
          label: "Support",
          icon: LifeBuoy,
          path: `/${slug}/supports`,
        },
        profile,
      ];
    case "SUPPLIER":
      return [
        dashboard,
        {
          label: "Onboarding Verification",
          icon: FileCheck,
          path: `/${slug}/verifications`,
        },
        {
          label: "Open RFQs",
          icon: FileText,
          path: `/${slug}/sourcing`,
        },
        {
          label: "Assigned Inspections",
          icon: ClipboardCheck,
          path: `/${slug}/quality-control`,
        },
        profile,
      ];
    case "LOGISTICS_PARTNER":
      return [
        dashboard,
        {
          label: "Shipment Bookings",
          icon: Truck,
          path: `/${slug}/logistics`,
        },
        {
          label: "Support",
          icon: LifeBuoy,
          path: `/${slug}/supports`,
        },
        profile,
      ];
    default:
      return [dashboard, profile];
  }
};

export const roleCanAccess = (role: UserRole, page: DashboardPageKey) => {
  const groups = getNavigation(role);
  return groups.some((group) => {
    if (
      group.path?.endsWith(`/${page}`) ||
      (page === "dashboard" && group.path?.endsWith("/dashboard"))
    ) {
      return true;
    }
    return group.children?.some((child) => child.key === page) ?? false;
  });
};
