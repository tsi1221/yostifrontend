import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordValues {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: ForgotPasswordValues) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    message.success(`Password reset link sent to ${values.email}`);

    setLoading(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 flex items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,57,82,0.10)]">
        
        {/* Header */}
        <div className="px-6 pt-8 pb-3 text-center sm:px-8">
          <h1 className="text-2xl font-bold text-[#0F3952]">
            Forgot Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-7 pt-3 sm:px-8">
          <Form<ForgotPasswordValues>
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              className="!mb-4"
              rules={[
                {
                  required: true,
                  message: "Email is required",
                },
                {
                  type: "email",
                  message: "Enter a valid email",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your email"
                className="!rounded-lg"
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                className="!h-11 !rounded-lg !border-[#0F3952] !bg-[#0F3952] !font-semibold hover:!border-[#174d6b] hover:!bg-[#174d6b]"
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>

          {/* Login */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <span className="text-sm text-slate-500">
              Remembered your password?{" "}
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-[#0F3952] hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;