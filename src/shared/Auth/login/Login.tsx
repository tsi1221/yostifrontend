import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import type { UserRole } from "../../layout/Sidebar"; 

import LoginForm, {
  type LoginFormValues,
} from "./LoginForm";

import { MOCK_USERS } from "./mockUsers";

/* =========================================================
   PROPS
========================================================= */

interface LoginProps {
  setRole: (role: UserRole | null) => void;
  setEmail: (email: string | null) => void;
}

/* =========================================================
   ROLE SLUG
========================================================= */

const getRoleSlug = (role: UserRole): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "superadmin";

    case "LOGISTICS_PARTNER":
      return "logistics";

    case "STAFF":
      return "staff";

    case "BUYER":
      return "buyer";

    case "SUPPLIER":
      return "supplier";

    default:
      return "buyer";
  }
};

/* =========================================================
   ROLE LABEL
========================================================= */

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";

    case "LOGISTICS_PARTNER":
      return "Logistics Partner";

    case "STAFF":
      return "Staff";

    case "BUYER":
      return "Buyer";

    case "SUPPLIER":
      return "Supplier";

    default:
      return role;
  }
};

/* =========================================================
   LOGIN
========================================================= */

export default function Login({
  setRole,
  setEmail,
}: LoginProps) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  /* =======================================================
     LOGIN HANDLER
  ======================================================= */

  const handleLogin = async (
    values: LoginFormValues
  ) => {
    setLoading(true);

    try {
      // Simulate API request
      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      const normalizedEmail = values.email
        .trim()
        .toLowerCase();

      const user = MOCK_USERS.find(
        (item) =>
          item.email.toLowerCase() ===
            normalizedEmail &&
          item.password === values.password
      );

      /* Invalid login */

      if (!user) {
        message.error(
          "Invalid email or password."
        );

        return;
      }

      const role = user.role;
      const email = user.email;

      /* Clear old session */

      localStorage.removeItem("role");
      localStorage.removeItem("email");

      sessionStorage.removeItem("role");
      sessionStorage.removeItem("email");

      /* Select storage */

      const storage = values.remember
        ? localStorage
        : sessionStorage;

      /* Save authentication */

      storage.setItem("role", role);
      storage.setItem("email", email);

      /* Update application state */

      setRole(role);
      setEmail(email);

      /* Success message */

      message.success(
        `Welcome back, ${getRoleLabel(role)}!`
      );

      /* Redirect */

      navigate(
        `/${getRoleSlug(role)}/dashboard`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      message.error(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="
        min-h-screen
        w-full
        bg-slate-50
        px-4
        py-6
        flex
        items-center
        justify-center
      "
    >
      <LoginForm
        loading={loading}
        onFinish={handleLogin}
        onForgotPassword={() =>
          navigate("/forgot-password")
        }
        onRegister={() =>
          navigate("/register")
        }
      />
    </main>
  );
}