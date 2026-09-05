
import {
  Form,
  Input,
  Button,
  Checkbox,
} from "antd";

import {
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

export interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

interface LoginFormProps {
  loading: boolean;
  onFinish: (values: LoginFormValues) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export default function LoginForm({
  loading,
  onFinish,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  return (
    <div
      className="
        w-full
        max-w-md
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_20px_60px_rgba(15,57,82,0.10)]
      "
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-3 text-center">
        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Welcome Back
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <div className="px-8 pb-7 pt-3">
        <Form<LoginFormValues>
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
          initialValues={{ remember: true }}
        >
          {/* Email */}
          <Form.Item
            name="email"
            label={
              <span className="font-medium text-slate-700">
                Email address
              </span>
            }
            className="!mb-4"
            rules={[
              {
                required: true,
                message: "Please enter your email.",
              },
              {
                type: "email",
                message:
                  "Please enter a valid email address.",
              },
            ]}
          >
            <Input
              prefix={
                <MailOutlined className="text-slate-400" />
              }
              placeholder="user@gmail.com"
              autoComplete="email"
              className="!rounded-lg"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label={
              <span className="font-medium text-slate-700">
                Password
              </span>
            }
            className="!mb-4"
            rules={[
              {
                required: true,
                message: "Please enter your password.",
              },
              {
                min: 6,
                message:
                  "Password must be at least 6 characters.",
              },
            ]}
          >
            <Input.Password
              prefix={
                <LockOutlined className="text-slate-400" />
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              className="!rounded-lg"
            />
          </Form.Item>

          {/* Options */}
          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >
            <Form.Item
              name="remember"
              valuePropName="checked"
              noStyle
            >
              <Checkbox>
                <span className="text-sm text-slate-600">
                  Remember me
                </span>
              </Checkbox>
            </Form.Item>

            <button
              type="button"
              onClick={onForgotPassword}
              className="
                text-sm
                font-semibold
                text-[#0F3952]
                hover:underline
              "
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <Form.Item className="!mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={
                !loading ? (
                  <ArrowRightOutlined />
                ) : undefined
              }
              iconPosition="end"
              className="
                !h-11
                !rounded-lg
                !border-0
                !bg-[#0F3952]
                !font-semibold
                !shadow-[0_6px_18px_rgba(15,57,82,0.18)]
                hover:!bg-[#0F3952]/90
              "
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Form.Item>
        </Form>

        {/* Register */}
        <div
          className="
            mt-6
            border-t
            border-slate-100
            pt-5
            text-center
          "
        >
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}

            <button
              type="button"
              onClick={onRegister}
              className="
                font-semibold
                text-[#0F3952]
                hover:underline
              "
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
