import { useState } from "react";
import { Form, Input, Button, message, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/BackgroundLayout";
import type { Role } from "../components/Sidebar";

/* ================= MOCK USERS ================= */
const MOCK_USERS: { email: string; password: string; role: Role }[] = [
  { email: "buyer@example.com", password: "password123", role: "buyer" },
  { email: "supplier@example.com", password: "password123", role: "supplier" },
  { email: "admin@example.com", password: "password123", role: "admin" },
  { email: "superadmin@example.com", password: "password123", role: "super-admin" },
  { email: "logistics@example.com", password: "password123", role: "logistics" },
];

/* ================= PROPS ================= */
interface LoginProps {
  setRole: (role: Role | null) => void;
  setEmail: (email: string | null) => void;
}

/* ================= FORM VALUES ================= */
interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

/* ================= DASHBOARD ROUTES ================= */
const DASHBOARD_BY_ROLE: Record<Role, string> = {
  buyer: "/buyer/dashboard",
  supplier: "/supplier/dashboard",
  admin: "/admin/dashboard",
  "super-admin": "/superadmin/dashboard",
  logistics: "/logistics/dashboard",
  student: "/student/dashboard", // safe fallback
};

/* ================= COMPONENT ================= */
const Login: React.FC<LoginProps> = ({ setRole, setEmail }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    await new Promise((res) => setTimeout(res, 700));

    const user = MOCK_USERS.find(
      (u) => u.email === values.email && u.password === values.password
    );

    if (!user) {
      message.error("Invalid email or password");
      setLoading(false);
      return;
    }

    const storage = values.remember ? localStorage : sessionStorage;
    storage.setItem("role", user.role);
    storage.setItem("email", user.email);

    setRole(user.role);
    setEmail(user.email);

    message.success(`Welcome ${user.role.replace("-", " ")}`);

    navigate(DASHBOARD_BY_ROLE[user.role], { replace: true });
    setLoading(false);
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
            loading={loading}
            block
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
