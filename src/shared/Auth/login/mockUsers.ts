import type { UserRole } from "../../layout/Sidebar";

export interface MockUser {
  email: string;
  password: string;
  role: UserRole;
}

export const MOCK_USERS: MockUser[] = [
  {
    email: "admin@example.com",
    password: "password123",
    role: "SUPER_ADMIN",
  },
  {
    email: "staff@example.com",
    password: "password123",
    role: "STAFF",
  },
  {
    email: "buyer@example.com",
    password: "password123",
    role: "BUYER",
  },
  {
    email: "supplier@example.com",
    password: "password123",
    role: "SUPPLIER",
  },
  {
    email: "logistics@example.com",
    password: "password123",
    role: "LOGISTICS_PARTNER",
  },
];