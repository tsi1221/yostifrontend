import React, { useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/BackgroundLayout";
import { registerUser, type RegisterData } from "../api/api";

const { Option } = Select;

interface RegisterFormValues {
  full_name: string;
  company_name?: string;
  country: string;
  phone: string;
  email: string;
  password: string;
  account_type: "individual" | "business" | "supplier" | "logistics";
  language_preference?: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const data: RegisterData = {
        fullName: values.full_name,
        companyName: values.company_name || "",
        country: values.country,
        phone: values.phone,
        email: values.email,
        password: values.password,
        accountType: values.account_type,
        languagePreference: values.language_preference || "en",
      };

      const response = await registerUser(data);
      if (response.success) {
        message.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error: any) {
      message.error(error?.msg || error?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center mb-6" style={{ color: "#0F3952" }}>
          Create Your Account
        </h2>

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="John Doe" size="large" />
          </Form.Item>

          <Form.Item name="company_name" label="Company Name (optional)">
            <Input placeholder="Optional" size="large" />
          </Form.Item>

          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Select placeholder="Choose your country" size="large">
              <Option value="Ethiopia">Ethiopia</Option>
              <Option value="China">China</Option>
              <Option value="Uganda">Uganda</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="+251 9xxxxxxx" size="large" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="example@email.com" size="large" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true }, { min: 6 }]}>
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item name="account_type" label="Account Type" rules={[{ required: true }]}>
            <Select placeholder="Choose user role" size="large">
              <Option value="individual">Individual</Option>
              <Option value="business">Business / Buyer</Option>
              <Option value="supplier">Supplier</Option>
              <Option value="logistics">Logistics</Option>
            </Select>
          </Form.Item>

          <Form.Item name="language_preference" label="Language Preference" initialValue="en">
            <Select size="large">
              <Option value="en">English</Option>
              <Option value="am">Amharic</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block style={{ backgroundColor: "#0F3952", borderRadius: "10px" }}>
              Register
            </Button>
          </Form.Item>
        </Form>

        <p className="text-center mt-4 text-gray-700">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0F3952" }} className="font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
