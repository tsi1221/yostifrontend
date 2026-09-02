import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

interface TwoFAFormValues {
  code: string;
}

const TwoFA: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: TwoFAFormValues) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (values.code === "123456") {
      message.success("2FA verified successfully!");

      const role = localStorage.getItem("role");

      if (role) {
        navigate(`/${role}/dashboard`, { replace: true });
      } else {
        message.error("User role not found.");
        navigate("/login", { replace: true });
      }
    } else {
      message.error("Invalid 2FA code.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 flex items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,57,82,0.10)]">

        {/* Header */}
        <div className="px-6 pt-8 pb-3 text-center sm:px-8">
          <h1 className="text-2xl font-bold text-[#0F3952]">
            Two-Factor Authentication
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Enter the verification code sent to you.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-7 pt-3 sm:px-8">
          <Form<TwoFAFormValues>
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              name="code"
              label="Verification Code"
              className="!mb-4"
              rules={[
                {
                  required: true,
                  message: "Please enter your verification code",
                },
                {
                  len: 6,
                  message: "Code must be 6 digits",
                },
                {
                  pattern: /^\d+$/,
                  message: "Code must contain only numbers",
                },
              ]}
            >
              <Input
                size="large"
                maxLength={6}
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                className="!rounded-lg text-center !text-lg !tracking-[0.3em]"
              />
            </Form.Item>

            {/* Verify Button */}
            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                className="!h-11 !rounded-lg !border-[#0F3952] !bg-[#0F3952] !font-semibold hover:!border-[#174d6b] hover:!bg-[#174d6b]"
              >
                Verify Code
              </Button>
            </Form.Item>
          </Form>

          {/* Back to Login */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-[#0F3952] hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFA;