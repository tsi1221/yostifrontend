// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { Form, Input, Button, message, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/BackgroundLayout";
import { useAuthStore } from "../store/useAuthStore";
import type { Role } from "../components/Sidebar";

interface LoginProps {
  setRole: (role: Role | null) => void;
  setEmail: (email: string | null) => void;
}

interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

const DASHBOARD_BY_ROLE: Record<Role, string> = {
  buyer: "/buyer/dashboard",
  supplier: "/supplier/dashboard",
  admin: "/admin/dashboard",
  "super-admin": "/superadmin/dashboard",
  logistics: "/logistics/dashboard",
  student: "/student/dashboard",
};

const Login: React.FC<LoginProps> = ({ setRole, setEmail }) => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } =
    useAuthStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    clearError();

    try {
      await login({ email: values.email, password: values.password });

      // Get updated role and email from store
      const currentRole = useAuthStore.getState().role as Role | null;
      const currentUser = useAuthStore.getState().user;

      if (!currentRole || !currentUser) {
        message.error("Failed to login, please try again.");
        setLoading(false);
        return;
      }

      // Remember me storage
      const storage = values.remember ? localStorage : sessionStorage;
      storage.setItem("role", currentRole);
      storage.setItem("email", currentUser.email);

      setRole(currentRole);
      setEmail(currentUser.email);

      message.success(`Welcome back, ${currentUser.fullName}!`);
      navigate(DASHBOARD_BY_ROLE[currentRole], { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err?.msg || err?.message || "Invalid email or password";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#0F3952]">
          Login
        </h2>

        <Form<LoginFormValues> layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember Me</Checkbox>
          </Form.Item>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between mb-4 text-sm">
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-[#0F3952] cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading || isLoading}
            className="!bg-[#0F3952]"
          >
            Login
          </Button>
        </Form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#0F3952] font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
