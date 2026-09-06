import { useState } from "react";
import { Form, Input, Button, Select, Checkbox, message } from "antd";
import { Link, useNavigate } from "react-router-dom";

import {
  AuthRequestError,
  REGISTER_ROLE_OPTIONS,
  persistPendingRegisterProfile,
  registerAccount,
  roleIdForRole,
} from "../../dashboard/auth";
import type { RegisterRole } from "../../dashboard/types/auth";

interface RegisterFormValues {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  country: string;
  phoneWhatsapp: string;
  role: RegisterRole;
  roleId: number;
  terms: boolean;
}

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullname: values.fullname.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        companyName: values.companyName.trim(),
        country: values.country.trim(),
        phoneWhatsapp: values.phoneWhatsapp.trim(),
        role: values.role,
        roleId: values.roleId,
      };

      const data = await registerAccount(payload);
      persistPendingRegisterProfile({
        email: payload.email,
        fullname: payload.fullname,
        companyName: payload.companyName,
        country: payload.country,
        phoneWhatsapp: payload.phoneWhatsapp,
      });
      const successMessage = Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;

      message.success(successMessage || "Account created successfully!");
      navigate("/login", {
        replace: true,
        state: { registered: true, email: payload.email },
      });
    } catch (error) {
      if (error instanceof AuthRequestError && error.field === "email") {
        form.setFields([
          {
            name: "email",
            errors: [error.message],
          },
        ]);
        message.error(error.message);
        return;
      }

      message.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,57,82,0.10)]">
        <div className="px-6 pb-4 pt-7 text-center sm:px-8">
          <h1 className="text-2xl font-bold text-[#0F3952]">Create Your Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register to get started with Yosti
          </p>
        </div>

        <div className="px-6 pb-6 sm:px-8">
          <Form<RegisterFormValues>
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            autoComplete="off"
            disabled={loading}
            initialValues={{
              role: "Buyer",
              roleId: 1,
              companyName: "",
            }}
          >
            <Form.Item
              name="fullname"
              label="Full name"
              className="!mb-3"
              rules={[
                { required: true, whitespace: true, message: "Full name is required." },
                { min: 2, message: "Full name must be at least 2 characters." },
              ]}
            >
              <Input size="large" placeholder="Enter your full name" className="!rounded-lg" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              className="!mb-3"
              rules={[
                { required: true, whitespace: true, message: "Email is required." },
                { type: "email", message: "Enter a valid email address." },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your email"
                className="!rounded-lg"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              className="!mb-3"
              rules={[
                { required: true, message: "Password is required." },
                { min: 8, message: "Password must be at least 8 characters." },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Create a password"
                className="!rounded-lg"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm password"
              className="!mb-3"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match."));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Re-enter your password"
                className="!rounded-lg"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item name="companyName" label="Company name" className="!mb-3">
              <Input
                size="large"
                placeholder="Enter company name"
                className="!rounded-lg"
                autoComplete="organization"
              />
            </Form.Item>

            <Form.Item
              name="country"
              label="Country"
              className="!mb-3"
              rules={[
                { required: true, whitespace: true, message: "Country is required." },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your country"
                className="!rounded-lg"
                autoComplete="country-name"
              />
            </Form.Item>

            <Form.Item
              name="phoneWhatsapp"
              label="Phone / WhatsApp"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Phone / WhatsApp number is required.",
                },
                { min: 7, message: "Enter a valid phone number." },
              ]}
            >
              <Input
                size="large"
                placeholder="+251 9XX XXX XXX"
                className="!rounded-lg"
                autoComplete="tel"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Account type"
              className="!mb-3"
              rules={[{ required: true, message: "Please select an account type." }]}
            >
              <Select
                size="large"
                placeholder="Select account type"
                className="w-full"
                options={REGISTER_ROLE_OPTIONS.map((option) => ({
                  label: option.label,
                  value: option.role,
                }))}
                onChange={(role: RegisterRole) => {
                  form.setFieldValue("roleId", roleIdForRole(role));
                }}
              />
            </Form.Item>

            <Form.Item name="roleId" hidden>
              <Input type="hidden" />
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              className="!mb-4"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Please accept the Terms & Conditions.")),
                },
              ]}
            >
              <Checkbox>
                <span className="text-sm text-slate-600">
                  I agree to the{" "}
                  <Link to="/terms" className="font-semibold text-[#0F3952] hover:underline">
                    Terms & Conditions
                  </Link>
                </span>
              </Checkbox>
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading}
                size="large"
                block
                className="!h-11 !rounded-lg !border-[#0F3952] !bg-[#0F3952] !font-semibold !text-white hover:!border-[#174d6b] hover:!bg-[#174d6b]"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <span className="text-sm text-slate-500">Already have an account? </span>
            <Link to="/login" className="text-sm font-semibold text-[#0F3952] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
