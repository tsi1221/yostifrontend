import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import type { UserRole } from "../../layout/Sidebar";

import LoginForm, { type LoginFormValues } from "./LoginForm";
import {
  findMockUser,
  getRoleDashboardPath,
  getRoleLabel,
  normalizeLoginRole,
} from "./mockUsers";

interface LoginProps {
  setRole: (role: UserRole | null) => void;
  setEmail: (email: string | null) => void;
}

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  email?: string;
  role?: string;
  message?: string | string[];
}

interface AuthSession {
  role: UserRole;
  email: string;
  token: string;
}

const apiBase = String(import.meta.env.VITE_API_URL ?? "")
  .trim()
  .replace(/\/$/, "");

function loginEndpoints() {
  const endpoints = ["/api/auth/login"];
  if (apiBase) {
    endpoints.unshift(`${apiBase}/auth/login`);
  }
  return endpoints;
}

async function tryApiLogin(
  email: string,
  password: string
): Promise<AuthSession | null> {
  for (const url of loginEndpoints()) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        continue;
      }

      const data = (await response.json().catch(() => ({}))) as LoginResponse;
      if (!response.ok) {
        continue;
      }

      const role = normalizeLoginRole(data.user?.role ?? data.role);
      if (!role) {
        continue;
      }

      return {
        role,
        email: data.user?.email || data.email || email,
        token: data.accessToken || data.access_token || data.token || "api-session",
      };
    } catch {
      continue;
    }
  }

  return null;
}

function persistSession(
  session: AuthSession,
  remember: boolean,
  setRole: LoginProps["setRole"],
  setEmail: LoginProps["setEmail"]
) {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("email");

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", session.token);
  storage.setItem("access_token", session.token);
  storage.setItem("role", session.role);
  storage.setItem("email", session.email);

  setRole(session.role);
  setEmail(session.email);
}

export default function Login({ setRole, setEmail }: LoginProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const email = values.email.trim().toLowerCase();
      const password = values.password;

      const apiSession = await tryApiLogin(email, password);
      const mockUser = findMockUser(email, password);
      const session: AuthSession | null = apiSession
        ? apiSession
        : mockUser
          ? {
              role: mockUser.role,
              email: mockUser.email,
              token: "demo",
            }
          : null;

      if (!session) {
        throw new Error("Invalid email or password.");
      }

      persistSession(session, Boolean(values.remember ?? true), setRole, setEmail);
      message.success(`Welcome back, ${getRoleLabel(session.role)}!`);
      navigate(getRoleDashboardPath(session.role), { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-6">
      <LoginForm
        loading={loading}
        onFinish={handleLogin}
        onForgotPassword={() => navigate("/forgot-password")}
        onRegister={() => navigate("/register")}
      />
    </main>
  );
}
