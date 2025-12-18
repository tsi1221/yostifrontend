// src/pages/logistics/Profile.tsx
import { useState } from "react";
import { Button, Input, Upload, message, Form } from "antd";
import { UploadOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";

interface LogisticsProfile {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  profile_pic?: string;
}

const initialProfile: LogisticsProfile = {
  name: "John Doe",
  company: "Global Shipping Ltd",
  email: "john.doe@example.com",
  phone: "0912345678",
  address: "456 Logistics St",
  city: "Addis Ababa",
  profile_pic: "",
};

export default function Profile() {
  const [profile, setProfile] = useState<LogisticsProfile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<LogisticsProfile>>(profile);
  const [profileFile, setProfileFile] = useState<any>(null);

  const handleInputChange = (field: keyof LogisticsProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.company) {
      message.error("Please fill in all required fields.");
      return;
    }
    setProfile({
      ...profile,
      ...formData,
      profile_pic: profileFile ? URL.createObjectURL(profileFile) : profile.profile_pic,
    });
    setEditing(false);
    message.success("Profile updated successfully!");
  };

  const inputStyle = {
    padding: "4px 6px",
    borderRadius: "4px",
    border: "1px solid #d9d9d9",
    fontSize: "13px",
    width: "100%",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 24,
      }}
    >
      <div
        style={{
          width: 750,
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ fontSize: 20 }}>Profile</h1>
          {!editing ? (
            <Button type="default" icon={<EditOutlined />} size="small" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="small"
              onClick={handleSaveProfile}
              style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff" }}
            >
              Save
            </Button>
          )}
        </div>

        {/* Profile Image */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src={profileFile ? URL.createObjectURL(profileFile) : profile.profile_pic || "https://via.placeholder.com/120"}
            alt="Profile"
            style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "2px solid #0F3952" }}
          />
          {editing && (
            <Upload
              beforeUpload={(file) => {
                setProfileFile(file);
                return false;
              }}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} block size="small" style={{ marginTop: 6 }}>
                Change Photo
              </Button>
            </Upload>
          )}
        </div>

        {/* Profile Form */}
        <Form layout="vertical" size="small">
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <Form.Item label="Full Name" style={{ flex: 1 }}>
              {editing ? <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} style={inputStyle} /> : <span>{profile.name}</span>}
            </Form.Item>
            <Form.Item label="Company" style={{ flex: 1 }}>
              {editing ? <Input value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} style={inputStyle} /> : <span>{profile.company}</span>}
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <Form.Item label="Email" style={{ flex: 1 }}>
              {editing ? <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} style={inputStyle} /> : <span>{profile.email}</span>}
            </Form.Item>
            <Form.Item label="Phone" style={{ flex: 1 }}>
              {editing ? <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} style={inputStyle} /> : <span>{profile.phone}</span>}
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Form.Item label="Address" style={{ flex: 1 }}>
              {editing ? <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} style={inputStyle} /> : <span>{profile.address}</span>}
            </Form.Item>
            <Form.Item label="City" style={{ flex: 1 }}>
              {editing ? <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} style={inputStyle} /> : <span>{profile.city}</span>}
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}
