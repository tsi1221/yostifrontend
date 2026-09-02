
import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import type { UserRole } from "../../layout/Sidebar";

import LoginForm, {
  type LoginFormValues,
} from "./LoginForm";

/* =========================================================
   PROPS
========================================================= */

interface LoginProps {
  setRole: (role: UserRole | null) => void;
  setEmail: (email: string | null) => void;
}

/* =========================================================
   API RESPONSE
========================================================= */

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;

  user?: {
    id?: string;
    email?: string;
    role?: UserRole;
  };

  email?: string;
  role?: UserRole;

  message?: string | string[];
}

/* =========================================================
   ROLE SLUG
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

    case "STAFF":
      return "Staff";

    case "BUYER":
      return "Buyer";

    case "SUPPLIER":
      return "Supplier";

    case "LOGISTICS_PARTNER":
      return "Logistics Partner";

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
     HANDLE LOGIN
  ======================================================= */

  const handleLogin = async (
    values: LoginFormValues
  ) => {
    setLoading(true);

    try {
      /* ===================================================
         NORMALIZE FORM DATA
      =================================================== */

      const email = values.email
        .trim()
        .toLowerCase();

      const password = values.password;

      /* ===================================================
         LOGIN REQUEST
         
         IMPORTANT:
         We use /api/auth/login instead of the full
         backend URL. Vite proxy handles the request.
      =================================================== */

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      /* ===================================================
         READ RESPONSE
      =================================================== */

      const data: LoginResponse =
        await response.json().catch(() => ({}));

      /* ===================================================
         API ERROR
      =================================================== */

      if (!response.ok) {
        const apiMessage = Array.isArray(
          data.message
        )
          ? data.message.join(", ")
          : data.message;

        throw new Error(
          apiMessage ||
            "Invalid email or password."
        );
      }

      /* ===================================================
         TOKEN
      =================================================== */

      const token =
        data.accessToken ||
        data.access_token ||
        data.token;

      /* ===================================================
         USER EMAIL
      =================================================== */

      const userEmail =
        data.user?.email ||
        data.email ||
        email;

      /* ===================================================
         USER ROLE
      =================================================== */

      const role =
        data.user?.role ||
        data.role;

      /*
       * Your frontend uses the role to determine
       * which dashboard the user should see.
       */
      if (!role) {
        console.error(
          "Login response:",
          data
        );

        throw new Error(
          "Login succeeded, but the user role was not returned."
        );
      }

      /* ===================================================
         CLEAR OLD SESSION
      =================================================== */

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("email");

      /* ===================================================
         SELECT STORAGE
      =================================================== */

      const storage = values.remember
        ? localStorage
        : sessionStorage;

      /* ===================================================
         SAVE TOKEN
      =================================================== */

      if (token) {
        storage.setItem("token", token);
      }

      /* ===================================================
         SAVE USER DATA
      =================================================== */

      storage.setItem("role", role);
      storage.setItem("email", userEmail);

      /* ===================================================
         UPDATE APP STATE
      =================================================== */

      setRole(role);
      setEmail(userEmail);

      /* ===================================================
         SUCCESS
      =================================================== */

      message.success(
        `Welcome back, ${getRoleLabel(role)}!`
      );

      /* ===================================================
         REDIRECT
      =================================================== */

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
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
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
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        bg-slate-50
        px-4
        py-6
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
