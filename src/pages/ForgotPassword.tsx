import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../VisitorPublicUser/components/BackgroundLayout";

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    message.success(`Password reset link sent to ${values.email}`);
    setLoading(false);
    navigate("/login");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#0F3952]">
          Forgot Password
        </h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
          >
            <Input className="focus:border-[#FFD700] focus:ring-[#FFD700]" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="!bg-[#0F3952] border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#0b2c3e] transition-all duration-300"
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center text-black mt-4">
          Remembered your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#0F3952] font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
