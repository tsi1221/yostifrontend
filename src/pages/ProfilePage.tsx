// src/pages/Profile/ProfilePage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Upload } from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined, CameraOutlined } from "@ant-design/icons";
import { useProfile } from "../hooks/useProfile";
import { useNavigate } from "react-router-dom";

interface ProfilePageProps {
  role: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ role }) => {
  const { user, loading, updateProfile, updateProfileImage, changePassword } = useProfile();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [previewImage, setPreviewImage] = useState<string>(user?.profileImage || "");
  const navigate = useNavigate();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <div className="flex justify-center items-center h-screen">No user data</div>;

  const handlePasswordSubmit = async (values: any) => {
    await changePassword(values.currentPassword, values.newPassword);
    passwordForm.resetFields();
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");

    // Redirect to dashboard based on role
    const dashboardMap: Record<string, string> = {
      admin: "/admin/dashboard",
      buyer: "/buyer/dashboard",
      supplier: "/supplier/dashboard",
      "super-admin": "/superadmin/dashboard",
    };
    navigate(dashboardMap[role] || "/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col md:flex-row gap-6 font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-1/5 flex flex-col gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center">
          {/* Profile Image */}
          <div className="relative mb-3">
            <img
              src={previewImage || "https://via.placeholder.com/80"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <Upload
              beforeUpload={async (file) => {
                const reader = new FileReader();
                reader.onload = () => setPreviewImage(reader.result as string);
                reader.readAsDataURL(file);
                await updateProfileImage(file);
                return false;
              }}
              showUploadList={false}
            >
              <div className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full border-2 border-white cursor-pointer hover:bg-orange-600 transition-all">
                <CameraOutlined className="text-white text-xs" />
              </div>
            </Upload>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 truncate">{user.fullName}</h2>
          <p className="text-gray-400 mb-3 text-sm">{role}</p>

          <nav className="w-full space-y-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium">
              <UserOutlined /> Personal Info
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm transition-all">
              <LockOutlined /> Login & Password
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm mt-2 transition-all"
            >
              <LogoutOutlined /> Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-4/5 flex flex-col gap-5">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              fullName: user.fullName,
              phone: user.phone,
              country: user.country,
              companyName: user.companyName || "",
            }}
            onFinish={updateProfile}
            requiredMark={false}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="Full Name" name="fullName">
                <Input className="rounded-lg bg-gray-50 border-none h-10 focus:ring-2 focus:ring-orange-200" />
              </Form.Item>

              <Form.Item label="Phone Number" name="phone">
                <Input className="rounded-lg bg-gray-50 border-none h-10 focus:ring-2 focus:ring-orange-200" />
              </Form.Item>

              {["admin", "supplier"].includes(role) && (
                <Form.Item label="Company Name" name="companyName">
                  <Input className="rounded-lg bg-gray-50 border-none h-10 focus:ring-2 focus:ring-orange-200" />
                </Form.Item>
              )}

              <Form.Item label="Country / Location" name="country">
                <Input className="rounded-lg bg-gray-50 border-none h-10 focus:ring-2 focus:ring-orange-200" />
              </Form.Item>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                htmlType="reset"
                className="h-10 px-6 rounded-lg border-orange-500 text-orange-500 hover:text-orange-600 hover:border-orange-600 font-semibold"
              >
                Discard
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="h-10 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 border-none font-semibold shadow-md shadow-orange-200"
              >
                Save
              </Button>
            </div>
          </Form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            requiredMark={false}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[{ required: true, message: "Enter current password" }]}
              >
                <Input.Password className="rounded-lg bg-gray-50 border-none h-10" />
              </Form.Item>

              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[{ required: true, message: "Enter new password" }]}
              >
                <Input.Password className="rounded-lg bg-gray-50 border-none h-10" />
              </Form.Item>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                type="primary"
                htmlType="submit"
                className="h-10 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 border-none font-semibold shadow-md shadow-orange-200"
              >
                Change Password
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
