
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";

type RegisterRole =
  | "Buyer"
  | "Supplier"
  | "Logistics Partner";

interface RegisterFormValues {
  fullname: string;
  email: string;
  password: string;
  companyName?: string;
  country: string;
  phoneWhatsapp: string;
  role: RegisterRole;
  terms: boolean;
}

interface RegisterPayload {
  fullname: string;
  email: string;
  password: string;
  companyName?: string;
  country: string;
  phoneWhatsapp: string;
  role: RegisterRole;
  roleId: number;
}

interface ApiResponse {
  message?: string | string[];
  error?: string | string[];
  statusCode?: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://yosti.nedhigibe.com/api/";

const ROLE_OPTIONS: {
  label: string;
  value: RegisterRole;
  roleId: number;
}[] = [
  {
    label: "Buyer",
    value: "Buyer",
    roleId: 1,
  },
  {
    label: "Supplier",
    value: "Supplier",
    roleId: 2,
  },
  {
    label: "Logistics Partner",
    value: "Logistics Partner",
    roleId: 3,
  },
];

const getApiErrorMessage = (
  data: ApiResponse | null,
  fallback: string
): string => {
  if (!data) {
    return fallback;
  }

  if (Array.isArray(data.message)) {
    return data.message.join(", ");
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (Array.isArray(data.error)) {
    return data.error.join(", ");
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  return fallback;
};

const parseResponse = async (
  response: Response
): Promise<ApiResponse | null> => {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return null;
  }
};

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    values: RegisterFormValues
  ) => {
    if (loading) {
      return;
    }

    if (!values.terms) {
      message.error(
        "Please accept the Terms & Conditions."
      );
      return;
    }

    const selectedRole = ROLE_OPTIONS.find(
      (item) => item.value === values.role
    );

    if (!selectedRole) {
      message.error(
        "Please select a valid account type."
      );
      return;
    }

    setLoading(true);

    try {
      const payload: RegisterPayload = {
        fullname: values.fullname.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        companyName:
          values.companyName?.trim() || undefined,
        country: values.country.trim(),
        phoneWhatsapp: values.phoneWhatsapp.trim(),
        role: selectedRole.value,
        roleId: selectedRole.roleId,
      };

      const response = await fetch(
        `${API_BASE_URL}auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            `Registration failed. Server returned ${response.status}.`
          )
        );
      }

      message.success({
        content:
          typeof data?.message === "string"
            ? data.message
            : "Account created successfully!",
        duration: 3,
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email: values.email
              .trim()
              .toLowerCase(),
          },
        });
      }, 800);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      if (
        error instanceof TypeError &&
        error.message.toLowerCase().includes("fetch")
      ) {
        message.error({
          content:
            "Unable to connect to the server. Please check your internet connection or contact the administrator.",
          duration: 5,
        });
      } else {
        message.error({
          content:
            error instanceof Error
              ? error.message
              : "Unable to create your account. Please try again.",
          duration: 5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        items-center
        justify-center
        bg-slate-50
        px-4
        py-8
      "
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,57,82,0.10)]
        "
      >
        <div
          className="
            px-6
            pb-4
            pt-7
            text-center
            sm:px-8
          "
        >
          <h1
            className="
              text-2xl
              font-bold
              text-[#0F3952]
            "
          >
            Create Your Account
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Register to get started with Yosti
          </p>
        </div>

        <div
          className="
            px-6
            pb-6
            sm:px-8
          "
        >
          <Form<RegisterFormValues>
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            autoComplete="off"
            disabled={loading}
          >
            <Form.Item
              name="fullname"
              label="Full Name"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message:
                    "Full name is required",
                },
                {
                  min: 2,
                  message:
                    "Full name must be at least 2 characters",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter your full name"
                className="!rounded-lg"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              name="companyName"
              label="Company Name"
              className="!mb-3"
            >
              <Input
                size="large"
                placeholder="Enter company name (optional)"
                className="!rounded-lg"
                autoComplete="organization"
              />
            </Form.Item>

            <Form.Item
              name="country"
              label="Country"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message:
                    "Country is required",
                },
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
                  message:
                    "Phone / WhatsApp number is required",
                },
                {
                  min: 7,
                  message:
                    "Enter a valid phone number",
                },
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
              name="email"
              label="Email"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message:
                    "Email is required",
                },
                {
                  type: "email",
                  message:
                    "Enter a valid email address",
                },
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
                {
                  required: true,
                  message:
                    "Password is required",
                },
                {
                  min: 6,
                  message:
                    "Password must be at least 6 characters",
                },
              ]}
              extra={
                <span className="text-xs text-slate-400">
                  Use at least 6 characters.
                </span>
              }
            >
              <Input.Password
                size="large"
                placeholder="Create a password"
                className="!rounded-lg"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Account Type"
              className="!mb-3"
              rules={[
                {
                  required: true,
                  message:
                    "Please select an account type",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select account type"
                className="w-full"
                options={ROLE_OPTIONS.map(
                  (role) => ({
                    label: role.label,
                    value: role.value,
                  })
                )}
              />
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
                      : Promise.reject(
                          new Error(
                            "Please accept the Terms & Conditions"
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
                    className="
                      font-semibold
                      text-[#0F3952]
                      hover:underline
                    "
                  >
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
                size="large"
                block
                className="
                  !h-11
                  !rounded-lg
                  !border-[#0F3952]
                  !bg-[#0F3952]
                  !font-semibold
                  hover:!border-[#174d6b]
                  hover:!bg-[#174d6b]
                "
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </Form.Item>
          </Form>

          <div
            className="
              mt-5
              border-t
              border-slate-100
              pt-4
              text-center
            "
          >
            <span
              className="
                text-sm
                text-slate-500
              "
            >
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="
                text-sm
                font-semibold
                text-[#0F3952]
                hover:underline
              "
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
