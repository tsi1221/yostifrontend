import { useEffect, useState, type ElementType } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Boxes,
  ShieldAlert,
  Settings,
} from "lucide-react";

/* =========================================================
   BRAND
========================================================= */

const BRAND_COLOR = "#0F3952";

/* =========================================================
   TYPES
========================================================= */

export type UserRole =
  | "SUPER_ADMIN"
  | "STAFF"
  | "BUYER"
  | "SUPPLIER"
  | "LOGISTICS_PARTNER";

export interface SidebarProps {
  role: UserRole;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SubMenuItem {
  label: string;
  path: string;
}

interface NavigationGroup {
  label: string;
  icon: ElementType;
  path?: string;
  children?: SubMenuItem[];
}

/* =========================================================
   UTILITIES
========================================================= */

const getRoleSlug = (role: UserRole): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "superadmin";
    case "STAFF":
      return "staff";
    case "BUYER":
      return "buyer";
    case "SUPPLIER":
      return "supplier";
    case "LOGISTICS_PARTNER":
      return "logistics";
    default:
      return "dashboard";
  }
};

/* =========================================================
   NAVIGATION
========================================================= */

const getNavigationByRole = (
  role: UserRole
): NavigationGroup[] => {
  const roleSlug = getRoleSlug(role);

  const dashboard: NavigationGroup = {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: `/${roleSlug}/dashboard`,
  };

  /* =======================================================
     SOURCING
  ======================================================= */

  const sourcingAndSuppliers: NavigationGroup = {
    label: "Sourcing & Suppliers",
    icon: Boxes,
    children: [
      {
        label: "Product Sourcing & RFQ",
        path: `/${roleSlug}/sourcing`,
      },
      {
        label: "Suppliers & Factories",
        path: `/${roleSlug}/suppliers`,
      },
      {
        label: "Export & Import Catalogs",
        path: `/${roleSlug}/catalogs`,
      },
    ].filter((item) => {
      // Supplier should not manage suppliers/factories
      if (
        role === "SUPPLIER" &&
        item.label === "Suppliers & Factories"
      ) {
        return false;
      }

      return true;
    }),
  };

  /* =======================================================
     LOGISTICS
  ======================================================= */

  const logisticsAndOperations: NavigationGroup = {
    label: "Logistics & Operations",
    icon: Truck,
    children: [
      {
        label: "Cargo & Tracking",
        path:
          role === "LOGISTICS_PARTNER"
            ? "/logistics/shipments"
            : `/${roleSlug}/logistics`,
      },
      {
        label: "Quality Control",
        path:
          role === "LOGISTICS_PARTNER"
            ? "/logistics/quality-control"
            : `/${roleSlug}/quality-control`,
      },
      {
        label: "After Sales & Claims",
        path:
          role === "LOGISTICS_PARTNER"
            ? "/logistics/claims"
            : `/${roleSlug}/claims`,
      },
    ],
  };

  /* =======================================================
     ADMINISTRATION
  ======================================================= */

  const administration: NavigationGroup = {
    label: "Administration",
    icon: ShieldAlert,
    children: [
      {
        label: "Users Management",
        path: "/superadmin/users",
      },
      {
        label: "Roles & Permissions",
        path: "/superadmin/roles",
      },
    ],
  };

  /* =======================================================
     SETTINGS
  ======================================================= */

  const settings: NavigationGroup = {
    label: "Settings",
    icon: Settings,
    path: `/${roleSlug}/settings`,
  };

  /* =======================================================
     ROLE BASED NAVIGATION
  ======================================================= */

  switch (role) {
    case "SUPER_ADMIN":
      return [
        dashboard,
        sourcingAndSuppliers,
        logisticsAndOperations,
        administration,
        settings,
      ];

    case "STAFF":
      return [
        dashboard,
        sourcingAndSuppliers,
        logisticsAndOperations,
        settings,
      ];

    case "BUYER":
      return [
        dashboard,
        sourcingAndSuppliers,
        logisticsAndOperations,
        settings,
      ];

    case "SUPPLIER":
      return [
        dashboard,
        sourcingAndSuppliers,
        logisticsAndOperations,
        settings,
      ];

    case "LOGISTICS_PARTNER":
      return [
        dashboard,
        logisticsAndOperations,
        settings,
      ];

    default:
      return [dashboard, settings];
  }
};

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({
  role,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();

  const [internalCollapsed, setInternalCollapsed] =
    useState(false);

  const collapsed =
    controlledCollapsed ?? internalCollapsed;

  const navigation = getNavigationByRole(role);

  /* =======================================================
     OPEN GROUP STATE
  ======================================================= */

  const [openGroups, setOpenGroups] = useState<
    Record<string, boolean>
  >(() => {
    const initialState: Record<string, boolean> = {};

    navigation.forEach((group) => {
      if (
        group.children?.some((child) =>
          location.pathname.startsWith(child.path)
        )
      ) {
        initialState[group.label] = true;
      }
    });

    return initialState;
  });

  /* =======================================================
     AUTO OPEN ACTIVE GROUP
  ======================================================= */

  useEffect(() => {
    const activeGroups: Record<string, boolean> = {};

    navigation.forEach((group) => {
      if (
        group.children?.some((child) =>
          location.pathname.startsWith(child.path)
        )
      ) {
        activeGroups[group.label] = true;
      }
    });

    if (Object.keys(activeGroups).length > 0) {
      setOpenGroups((previous) => ({
        ...previous,
        ...activeGroups,
      }));
    }
  }, [location.pathname, navigation]);

  /* =======================================================
     GROUP TOGGLE
  ======================================================= */

  const toggleGroup = (label: string) => {
    if (collapsed) {
      return;
    }

    setOpenGroups((previous) => ({
      ...previous,
      [label]: !previous[label],
    }));
  };

  /* =======================================================
     COLLAPSE
  ======================================================= */

  const handleCollapse = () => {
    const nextValue = !collapsed;

    if (onCollapsedChange) {
      onCollapsedChange(nextValue);
    } else {
      setInternalCollapsed(nextValue);
    }
  };

  /* =======================================================
     MOBILE
  ======================================================= */

  const handleNavigation = () => {
    onMobileClose?.();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          MOBILE BACKDROP
      ==================================================== */}

      {mobileOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-slate-950/40
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* ===================================================
          SIDEBAR
      ==================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-white
          border-r border-slate-200
          shadow-[4px_0_24px_rgba(15,57,82,0.06)]
          transition-all duration-300 ease-in-out

          ${collapsed ? "w-[84px]" : "w-[292px]"}

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className={`
            relative
            flex h-[82px]
            shrink-0
            items-center
            border-b border-slate-100

            ${
              collapsed
                ? "justify-center px-3"
                : "px-5"
            }
          `}
        >
          <div
            className={`
              flex items-center
              ${
                collapsed
                  ? "justify-center"
                  : "gap-3.5"
              }
            `}
          >
            {/* LOGO */}

            <div
              className="
                flex
                h-11 w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-xl
                font-extrabold
                text-white
                shadow-[0_5px_16px_rgba(15,57,82,0.22)]
              "
              style={{
                backgroundColor: BRAND_COLOR,
              }}
            >
              Y
            </div>

            {/* BRAND */}

            {!collapsed && (
              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-[18px]
                    font-bold
                    tracking-tight
                    text-slate-900
                  "
                >
                  Yosti Trading
                </h1>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  Management Portal
                </p>
              </div>
            )}
          </div>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={onMobileClose}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-xl
              p-2
              text-slate-400
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
            scrollbar-thin
          "
        >
          <div className="space-y-1.5">
            {navigation.map((group) => {
              const Icon = group.icon;

              const hasChildren =
                Boolean(group.children?.length);

              const isGroupActive =
                group.path === location.pathname ||
                group.children?.some((child) =>
                  location.pathname.startsWith(
                    child.path
                  )
                );

              /* ===========================================
                 SINGLE ITEM
              =========================================== */

              if (!hasChildren && group.path) {
                return (
                  <NavLink
                    key={group.path}
                    to={group.path}
                    onClick={handleNavigation}
                    title={
                      collapsed
                        ? group.label
                        : undefined
                    }
                    className={({ isActive }) => `
                      group
                      relative
                      flex
                      w-full
                      items-center
                      rounded-xl
                      font-semibold
                      transition-all
                      duration-200

                      ${
                        collapsed
                          ? "h-12 justify-center px-0"
                          : "min-h-12 gap-3 px-3.5 py-3"
                      }

                      ${
                        isActive
                          ? "text-white shadow-[0_5px_16px_rgba(15,57,82,0.18)]"
                          : "text-slate-600 hover:bg-[#0F3952]/[0.055] hover:text-[#0F3952]"
                      }
                    `}
                    style={({ isActive }) =>
                      isActive
                        ? {
                            backgroundColor:
                              BRAND_COLOR,
                          }
                        : undefined
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !collapsed && (
                          <span
                            className="
                              absolute
                              left-0
                              top-1/2
                              h-7
                              w-1
                              -translate-y-1/2
                              rounded-r-full
                              bg-white/80
                            "
                          />
                        )}

                        <Icon
                          size={21}
                          strokeWidth={
                            isActive ? 2.2 : 1.8
                          }
                          className={
                            isActive
                              ? "shrink-0 text-white"
                              : "shrink-0 text-slate-500 group-hover:text-[#0F3952]"
                          }
                        />

                        {!collapsed && (
                          <span className="truncate text-[14px] tracking-tight">
                            {group.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              }

              /* ===========================================
                 ACCORDION
              =========================================== */

              const isOpen =
                Boolean(openGroups[group.label]);

              return (
                <div
                  key={group.label}
                  className="pt-0.5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(group.label)
                    }
                    title={
                      collapsed
                        ? group.label
                        : undefined
                    }
                    className={`
                      group
                      relative
                      flex
                      w-full
                      items-center
                      rounded-xl
                      font-semibold
                      transition-all
                      duration-200

                      ${
                        collapsed
                          ? "h-12 justify-center px-0"
                          : "min-h-12 gap-3 px-3.5 py-3"
                      }

                      ${
                        isGroupActive
                          ? "text-[#0F3952]"
                          : "text-slate-600 hover:bg-[#0F3952]/[0.055] hover:text-[#0F3952]"
                      }
                    `}
                  >
                    {isGroupActive && !collapsed && (
                      <span
                        className="
                          absolute
                          left-0
                          top-1/2
                          h-6
                          w-1
                          -translate-y-1/2
                          rounded-r-full
                          bg-[#0F3952]
                        "
                      />
                    )}

                    <Icon
                      size={21}
                      strokeWidth={
                        isGroupActive ? 2.1 : 1.8
                      }
                      className={
                        isGroupActive
                          ? "shrink-0 text-[#0F3952]"
                          : "shrink-0 text-slate-500 group-hover:text-[#0F3952]"
                      }
                    />

                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left text-[14px] tracking-tight">
                          {group.label}
                        </span>

                        <ChevronDown
                          size={17}
                          className={`
                            shrink-0
                            text-slate-400
                            transition-transform
                            duration-200

                            ${
                              isOpen
                                ? "rotate-180 text-[#0F3952]"
                                : ""
                            }
                          `}
                        />
                      </>
                    )}
                  </button>

                  {/* SUB MENU */}

                  {!collapsed &&
                    isOpen &&
                    group.children && (
                      <div
                        className="
                          relative
                          ml-[22px]
                          mt-1
                          space-y-0.5
                          border-l
                          border-[#0F3952]/15
                          pl-3
                        "
                      >
                        {group.children.map(
                          (child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={
                                handleNavigation
                              }
                              className={({
                                isActive,
                              }) => `
                                group
                                flex
                                min-h-10
                                items-center
                                gap-2.5
                                rounded-lg
                                px-3
                                py-2
                                text-[13px]
                                font-medium
                                transition-all
                                duration-200

                                ${
                                  isActive
                                    ? "bg-[#0F3952] text-white shadow-[0_3px_10px_rgba(15,57,82,0.16)]"
                                    : "text-slate-500 hover:bg-[#0F3952]/[0.055] hover:text-[#0F3952]"
                                }
                              `}
                            >
                              {({
                                isActive,
                              }) => (
                                <>
                                  <span
                                    className={`
                                      h-1.5
                                      w-1.5
                                      shrink-0
                                      rounded-full

                                      ${
                                        isActive
                                          ? "bg-white"
                                          : "bg-slate-300 group-hover:bg-[#0F3952]"
                                      }
                                    `}
                                  />

                                  <span className="truncate">
                                    {child.label}
                                  </span>
                                </>
                              )}
                            </NavLink>
                          )
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-100
            bg-white
            p-3
          "
        >
          <button
            type="button"
            onClick={handleCollapse}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="
              flex
              h-10
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-slate-500
              transition-all
              duration-200
              hover:border-[#0F3952]/20
              hover:bg-[#0F3952]/[0.055]
              hover:text-[#0F3952]
            "
          >
            {collapsed ? (
              <ChevronRight
                size={19}
                strokeWidth={2}
              />
            ) : (
              <ChevronLeft
                size={19}
                strokeWidth={2}
              />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}