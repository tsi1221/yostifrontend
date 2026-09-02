import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  message,
} from "antd";
import { Link } from "react-router-dom";

const { Option } = Select;

/* =========================================================
   TYPES
========================================================= */

interface RegisterFormValues {
  full_name: string;
  company_name?: string;
  country: string;
  phone: string;
  email: string;
  password: string;
  account_type: "buyer" | "supplier" | "logistics";
  language_preference: "en" | "am" | "om" | "cn";
  terms: boolean;
}

/* =========================================================
   COMPONENT
========================================================= */

const Register = () => {
  const [loading, setLoading] = useState(false);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = (values: RegisterFormValues) => {
    if (!values.terms) {
      message.error("You must accept the Terms & Conditions");
      return;
    }

    setLoading(true);

    console.log("Registration Data:", values);

    // TODO: Connect to backend API

    setTimeout(() => {
      setLoading(false);
      message.success("Account created successfully!");
    }, 1000);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,57,82,0.10)] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-7 pb-3 text-center sm:px-8">
          <h1 className="text-2xl font-bold text-[#0F3952]">
            Create Your Account
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Register to get started
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 sm:px-8">
          <Form<RegisterFormValues>
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            {/* Full Name */}
            <Form.Item
              name="full_name"
              label="Full Name"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  message: "Full name is required",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your full name"
                className="!rounded-lg"
              />
            </Form.Item>

            {/* Company */}
            <Form.Item
              name="company_name"
              label="Company Name (optional)"
              className="!mb-3"
            >
              <Input
                size="large"
                placeholder="Enter company name"
                className="!rounded-lg"
              />
            </Form.Item>

            {/* Country */}
            <Form.Item
              name="country"
              label="Country"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  message: "Please enter your country",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your country"
                className="!rounded-lg"
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              name="phone"
              label="Phone / WhatsApp"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  message: "Phone number is required",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter phone number"
                className="!rounded-lg"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              label="Email"
              className="!mb-3"
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

            {/* Password */}
            <Form.Item
              name="password"
              label="Password"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  message: "Password is required",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Create a password"
                className="!rounded-lg"
              />
            </Form.Item>

            {/* Account + Language */}
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
              {/* Account Type */}
              <Form.Item
                name="account_type"
                label="Account Type"
                className="!mb-3"
                rules={[
                  {
                    required: true,
                    message: "Select an account type",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select account type"
                  className="w-full"
                >
                  <Option value="buyer">Buyer</Option>
                  <Option value="supplier">Supplier</Option>
                  <Option value="logistics">Logistics</Option>
                </Select>
              </Form.Item>

              {/* Language */}
              <Form.Item
                name="language_preference"
                label="Language"
                className="!mb-3"
                rules={[
                  {
                    required: true,
                    message: "Choose a language",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select language"
                  className="w-full"
                >
                  <Option value="en">English</Option>
                  <Option value="am">Amharic</Option>
                  <Option value="om">Oromiffa</Option>
                  <Option value="cn">Chinese</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Terms */}
            <Form.Item
              name="terms"
              valuePropName="checked"
              className="!mb-4"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Accept the Terms & Conditions"
                          )
                        ),
                },
              ]}
            >
              <Checkbox>
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-[#0F3952] hover:underline"
                  >
                    Terms & Conditions
                  </Link>
                </span>
              </Checkbox>
            </Form.Item>

            {/* Register Button */}
            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="!h-11 !rounded-lg !border-[#0F3952] !bg-[#0F3952] !font-semibold hover:!border-[#174d6b] hover:!bg-[#174d6b]"
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* Login */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <span className="text-sm text-slate-500">
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="text-sm font-semibold text-[#0F3952] hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;