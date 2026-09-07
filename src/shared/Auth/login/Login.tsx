import { useEffect, useState } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import {
  expireSession,
  getAuthUserDashboardPath,
  loginWithPassword,
  persistAuthSession,
  refreshStoredAuthProfile,
  useAuth,
} from "../../../dashboard/auth";

import LoginForm, { type LoginFormValues } from "./LoginForm";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const registeredEmail =
    typeof location.state === "object" &&
    location.state &&
    "email" in location.state &&
    typeof location.state.email === "string"
      ? location.state.email
      : undefined;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }
    navigate(getAuthUserDashboardPath(user), { replace: true });
  }, [isAuthenticated, navigate, user]);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const payload = await loginWithPassword({
        email: values.email,
        password: values.password,
      });

      persistAuthSession(payload);
      let sessionUser = payload.user;
      try {
        sessionUser = (await refreshStoredAuthProfile()) ?? payload.user;
      } catch {
        expireSession(navigate);
        return;
      }

      message.success(`Welcome back, ${sessionUser.fullname}!`);
      navigate(getAuthUserDashboardPath(sessionUser), { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
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
