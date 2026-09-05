import type { AuthLoginResponse } from "../types/auth";
import type { UserRole } from "../types";

interface PreviewAccount {
  email: string;
  password: string;
  fullname: string;
  role: UserRole;
  roleId: number;
  id: number;
}

const PREVIEW_PASSWORD = "password123";

const PREVIEW_ACCOUNTS: PreviewAccount[] = [
  {
    email: "admin@example.com",
    password: PREVIEW_PASSWORD,
    fullname: "Admin Dagi",
    role: "SUPER_ADMIN",
    roleId: 5,
    id: 2,
  },
  {
    email: "staff@example.com",
    password: PREVIEW_PASSWORD,
    fullname: "Diana Chen",
    role: "STAFF",
    roleId: 4,
    id: 5,
  },
  {
    email: "buyer@example.com",
    password: PREVIEW_PASSWORD,
    fullname: "Tadesse Gemechu",
    role: "BUYER",
    roleId: 1,
    id: 1,
  },
  {
    email: "supplier@example.com",
    password: PREVIEW_PASSWORD,
    fullname: "Wei Zhang",
    role: "SUPPLIER",
    roleId: 2,
    id: 3,
  },
  {
    email: "logistics@example.com",
    password: PREVIEW_PASSWORD,
    fullname: "Samuel Okello",
    role: "LOGISTICS_PARTNER",
    roleId: 3,
    id: 4,
  },
];

function previewToken(email: string) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ email, preview: true }));
  return `${header}.${payload}.preview`;
}

export function loginWithPreviewAccount(
  email: string,
  password: string
): AuthLoginResponse | null {
  const account = PREVIEW_ACCOUNTS.find(
    (item) => item.email === email.trim().toLowerCase() && item.password === password
  );
  if (!account) {
    return null;
  }

  return {
    access_token: previewToken(account.email),
    user: {
      id: account.id,
      fullname: account.fullname,
      email: account.email,
      roleId: account.roleId,
      role: account.role,
    },
  };
}
