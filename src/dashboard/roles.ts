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

const item = (basePath: string, key: DashboardPageKey, label: string): NavItem => ({
  key,
  label,
  path:
    key === "dashboard"
      ? basePath
      : basePath.replace(/\/dashboard$/, `/${key}`),
});

const DASHBOARD_PAGE_SEGMENTS = new Set<DashboardPageKey>([
  "dashboard",
  "users",
  "verifications",
  "sourcing",
  "logistics",
  "quality-control",
  "trips",
  "payments",
  "services",
  "supports",
  "blogs",
  "projects",
  "contacts",
  "roles",
  "profile",
]);

export function dashboardPath(page: DashboardPageKey, pathname?: string) {
  const currentPath =
    pathname ?? (typeof window === "undefined" ? "/dashboard" : window.location.pathname);
  const segments = currentPath.split("/").filter(Boolean);
  const prefix =
    segments[0] === "dashboard"
      ? "dashboard"
      : segments[1] && DASHBOARD_PAGE_SEGMENTS.has(segments[1] as DashboardPageKey)
        ? segments[0]
        : "dashboard";
  return `/${prefix}/${page}`;
}

export const getNavigation = (role: UserRole): NavGroup[] => {
  const path = (page: DashboardPageKey) => dashboardPath(page);

  const dashboard: NavGroup = {
    label: role === "SUPER_ADMIN" ? "Business Intelligence" : "Dashboard",
    icon: LayoutDashboard,
    path: path("dashboard"),
  };

  const profile: NavGroup = {
    label: "Profile",
    icon: UserRound,
    path: path("profile"),
  };

  switch (role) {
    case "SUPER_ADMIN":
      return [
        dashboard,
        {
          label: "Accounts",
          icon: Users,
          children: [
<<<<<<< yosti/dashboard-refactor-ac34
            item(slug, "users", "User Account Management"),
            item(slug, "roles", "Roles"),
            item(slug, "permissions", "Permissions"),
=======
            item(path("dashboard"), "users", "User Account Management"),
            item(path("dashboard"), "roles", "Roles"),
>>>>>>> local
          ],
        },
        {
          label: "Operations",
          icon: BriefcaseBusiness,
          children: [
            item(path("dashboard"), "verifications", "Supplier Verifications"),
            item(path("dashboard"), "sourcing", "Requests Management"),
            item(path("dashboard"), "logistics", "Shipments"),
            item(path("dashboard"), "payments", "Payments"),
            item(path("dashboard"), "quality-control", "Quality Reports"),
            item(path("dashboard"), "trips", "Visa Parameters"),
            item(path("dashboard"), "services", "Services"),
            item(path("dashboard"), "supports", "Support Tickets"),
            item(path("dashboard"), "blogs", "Blogs"),
            item(path("dashboard"), "projects", "Projects"),
            item(path("dashboard"), "contacts", "Contacts"),
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
          path: path("verifications"),
        },
        {
          label: "Sourcing board",
          icon: FileText,
          path: path("sourcing"),
        },
        {
          label: "Operations",
          icon: BriefcaseBusiness,
          children: [
            item(path("dashboard"), "quality-control", "Quality Reports"),
            item(path("dashboard"), "trips", "Visa Parameters"),
            item(path("dashboard"), "services", "Services"),
            item(path("dashboard"), "supports", "Support Tickets"),
            item(path("dashboard"), "blogs", "Blogs"),
            item(path("dashboard"), "projects", "Projects"),
            item(path("dashboard"), "contacts", "Contacts"),
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
            item(path("dashboard"), "sourcing", "Submit Sourcing Request"),
            item(path("dashboard"), "logistics", "Cargo Tracking System"),
            item(path("dashboard"), "quality-control", "Request Quality Inspection"),
            item(path("dashboard"), "trips", "Visa / Business Trip"),
            item(path("dashboard"), "services", "Services"),
          ],
        },
        {
          label: "Payments & Invoices",
          icon: BriefcaseBusiness,
          path: path("payments"),
        },
        {
          label: "Support",
          icon: LifeBuoy,
          path: path("supports"),
        },
        profile,
      ];
    case "SUPPLIER":
      return [
        dashboard,
        {
          label: "Onboarding Verification",
          icon: FileCheck,
          path: path("verifications"),
        },
        {
          label: "Open RFQs",
          icon: FileText,
          path: path("sourcing"),
        },
        {
          label: "Assigned Inspections",
          icon: ClipboardCheck,
          path: path("quality-control"),
        },
        profile,
      ];
    case "LOGISTICS_PARTNER":
      return [
        dashboard,
        {
          label: "Shipment Bookings",
          icon: Truck,
          path: path("logistics"),
        },
        {
          label: "Support",
          icon: LifeBuoy,
          path: path("supports"),
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

export function pageKeyFromPath(path: string): DashboardPageKey | null {
  const segment = path.split("/").filter(Boolean)[1];
  if (!segment) {
    return null;
  }
  if (segment === "dashboard") {
    return "dashboard";
  }
  return segment as DashboardPageKey;
}

export function filterNavigation(
  groups: NavGroup[],
  canOpen: (page: DashboardPageKey) => boolean,
): NavGroup[] {
  return groups.flatMap((group) => {
    if (group.path) {
      const key = pageKeyFromPath(group.path);
      if (key && !canOpen(key)) {
        return [];
      }
      return [group];
    }

    const children = group.children?.filter((child) => canOpen(child.key));
    if (!children?.length) {
      return [];
    }
    return [{ ...group, children }];
  });
}
