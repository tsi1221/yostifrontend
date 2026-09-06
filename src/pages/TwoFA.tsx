import  { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../VisitorPublicUser/components/BackgroundLayout";

const TwoFA: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { code: string }) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (values.code === "123456") { // Mock 2FA code
      message.success("2FA verified! Redirecting...");
      const role = localStorage.getItem("role");
      navigate(`/${role}/dashboard`);
    } else {
      message.error("Invalid 2FA code");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#0F3952]">
          Two-Factor Authentication
        </h2>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="code"
            label="Enter 2FA Code"
            rules={[{ required: true, message: "Enter the 2FA code" }]}
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
              Verify
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthLayout>
  );
};

export default TwoFA;
