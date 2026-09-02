import {
  Bell,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   BRAND
========================================================= */

const BRAND_COLOR = "#0F3952";

/* =========================================================
   USER ROLES
========================================================= */

export type UserRole =
  | "SUPER_ADMIN"
  | "STAFF"
  | "BUYER"
  | "SUPPLIER"
  | "LOGISTICS_PARTNER";

/* =========================================================
   ROLE LABELS
========================================================= */

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  STAFF: "Staff",
  BUYER: "Buyer",
  SUPPLIER: "Supplier / Factory",
  LOGISTICS_PARTNER: "Logistics Partner",
};

/* =========================================================
   PROPS
========================================================= */

interface HeaderProps {
  role: UserRole;
  userName?: string;
  userImage?: string;

  onMobileMenuToggle?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;

  hasNotifications?: boolean;
}

/* =========================================================
   HEADER
========================================================= */

export default function Header({
  role,
  userName = "User",
  userImage,
  onMobileMenuToggle,
  onLogout,
  onProfileClick,
  hasNotifications = false,
}: HeaderProps) {
  const navigate = useNavigate();

  const roleLabel = roleLabels[role];

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    // Optional parent callback
    onLogout?.();

    // Go back to HOME
    navigate("/", {
      replace: true,
    });
  };

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-[72px] w-full
        items-center justify-between
        border-b border-slate-200
        bg-white
        px-4 sm:px-6
      "
    >
      {/* ===================================================
          LEFT SIDE
      ==================================================== */}

      <div className="flex items-center">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="Open navigation"
            title="Open navigation"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              text-slate-700
              transition-colors
              duration-200
              hover:bg-[#0F3952]/[0.06]
              hover:text-[#0F3952]
              active:scale-95
              lg:hidden
            "
          >
            <Menu
              size={21}
              strokeWidth={1.9}
            />
          </button>
        )}
      </div>

      {/* ===================================================
          RIGHT SIDE
      ==================================================== */}

      <div className="flex items-center gap-2 sm:gap-3">

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <button
          type="button"
          aria-label="View notifications"
          title="Notifications"
          className="
            relative
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-700
            transition-all
            duration-200
            hover:border-[#0F3952]/20
            hover:bg-[#0F3952]/[0.06]
            hover:text-[#0F3952]
            active:scale-95
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#0F3952]/20
          "
        >
          <Bell
            size={19}
            strokeWidth={1.8}
          />

          {hasNotifications && (
            <span
              className="
                absolute
                right-[7px]
                top-[6px]
                h-2 w-2
                rounded-full
                bg-[#0F3952]
                ring-2 ring-white
              "
            />
          )}
        </button>

        {/* =================================================
            DIVIDER
        ================================================== */}

        <div
          className="
            hidden
            h-8 w-px
            bg-slate-200
            sm:block
          "
        />

        {/* =================================================
            PROFILE
        ================================================== */}

        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Open profile"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            px-2 py-1.5
            text-left
            transition-colors
            hover:bg-slate-50
          "
        >
          {/* Profile Image */}

          {userImage ? (
            <img
              src={userImage}
              alt={`${userName} profile`}
              className="
                h-10 w-10
                shrink-0
                rounded-full
                object-cover
                ring-2 ring-slate-100
              "
            />
          ) : (
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                text-white
                shadow-sm
              "
              style={{
                backgroundColor: BRAND_COLOR,
              }}
            >
              <UserRound
                size={18}
                strokeWidth={1.8}
              />
            </div>
          )}

          {/* User Information */}

          <div
            className="
              hidden
              min-w-0
              sm:block
            "
          >
            <p
              className="
                max-w-[160px]
                truncate
                text-[14px]
                font-semibold
                leading-5
                text-slate-900
              "
            >
              {userName}
            </p>

            <p
              className="
                max-w-[160px]
                truncate
                text-[12px]
                font-medium
                leading-4
                text-[#0F3952]
              "
            >
              {roleLabel}
            </p>
          </div>
        </button>

        {/* =================================================
            LOGOUT
        ================================================== */}

        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            text-slate-700
            transition-all
            duration-200
            hover:bg-red-50
            hover:text-red-600
            active:scale-95
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500/20
          "
        >
          <LogOut
            size={19}
            strokeWidth={1.8}
          />
        </button>
      </div>
    </header>
  );
}