import type { UserRole } from "../../layout/Sidebar";

export interface MockUser {
  email: string;
  password: string;
  role: UserRole;
}

export const DEMO_PASSWORD = "password123";

export const MOCK_USERS: MockUser[] = [
  {
    email: "admin@example.com",
    password: DEMO_PASSWORD,
    role: "SUPER_ADMIN",
  },
  {
    email: "admin@yostitrading.com",
    password: DEMO_PASSWORD,
    role: "SUPER_ADMIN",
  },
  {
    email: "staff@example.com",
    password: DEMO_PASSWORD,
    role: "STAFF",
  },
  {
    email: "staff@yostitrading.com",
    password: DEMO_PASSWORD,
    role: "STAFF",
  },
  {
    email: "buyer@example.com",
    password: DEMO_PASSWORD,
    role: "BUYER",
  },
  {
    email: "supplier@example.com",
    password: DEMO_PASSWORD,
    role: "SUPPLIER",
  },
  {
    email: "logistics@example.com",
    password: DEMO_PASSWORD,
    role: "LOGISTICS_PARTNER",
  },
];

const VALID_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "STAFF",
  "BUYER",
  "SUPPLIER",
  "LOGISTICS_PARTNER",
];

export function findMockUser(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return (
    MOCK_USERS.find(
      (user) => user.email === normalized && user.password === password
    ) ?? null
  );
}

export function normalizeLoginRole(value: string | null | undefined): UserRole | null {
  if (!value) {
    return null;
  }

  const upper = value.trim().toUpperCase();
  if (VALID_ROLES.includes(upper as UserRole)) {
    return upper as UserRole;
  }

  switch (value.trim().toLowerCase()) {
    case "super-admin":
    case "super_admin":
    case "superadmin":
      return "SUPER_ADMIN";
    case "staff":
    case "admin":
      return "STAFF";
    case "buyer":
    case "customer":
    case "importer":
      return "BUYER";
    case "supplier":
    case "factory":
    case "exporter":
      return "SUPPLIER";
    case "logistics":
    case "logistics-partner":
    case "logistics_partner":
    case "cargo":
      return "LOGISTICS_PARTNER";
    default:
      return null;
  }
}

export function getRoleSlug(role: UserRole): string {
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
      return "buyer";
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "System Admin";
    case "STAFF":
      return "Yosti Staff";
    case "BUYER":
      return "Customer / Buyer";
    case "SUPPLIER":
      return "Supplier / Factory";
    case "LOGISTICS_PARTNER":
      return "Logistics Partner";
    default:
      return role;
  }
}

export function getRoleDashboardPath(role: UserRole) {
  return `/${getRoleSlug(role)}/dashboard`;
}
