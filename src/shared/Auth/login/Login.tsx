import { useEffect, useState } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getAuthUserDashboardPath,
  getStoredAuthUser,
  hasValidAccessToken,
  loginWithPassword,
  persistAuthSession,
  roleFromAuthUser,
} from "../../../dashboard/auth";
import type { UserRole } from "../../layout/Sidebar";

import LoginForm, { type LoginFormValues } from "./LoginForm";

interface LoginProps {
  setRole: (role: UserRole | null) => void;
  setEmail: (email: string | null) => void;
}

export default function Login({ setRole, setEmail }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const registeredEmail =
    typeof location.state === "object" &&
    location.state &&
    "email" in location.state &&
    typeof location.state.email === "string"
      ? location.state.email
      : undefined;

  useEffect(() => {
    if (!hasValidAccessToken()) {
      return;
    }
    const user = getStoredAuthUser();
    if (!user) {
      return;
    }
    setRole(roleFromAuthUser(user));
    setEmail(user.email);
    navigate(getAuthUserDashboardPath(user), { replace: true });
  }, [navigate, setEmail, setRole]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const payload = await loginWithPassword({
        email: values.email,
        password: values.password,
      });

      persistAuthSession(payload);

      const role = roleFromAuthUser(payload.user);
      setRole(role);
      setEmail(payload.user.email);

      message.success(`Welcome back, ${payload.user.fullname}!`);
      navigate(getAuthUserDashboardPath(payload.user), { replace: true });
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
        initialEmail={registeredEmail}
        onFinish={handleLogin}
        onForgotPassword={() => navigate("/forgot-password")}
        onRegister={() => navigate("/register")}
      />
    </main>
  );
}
