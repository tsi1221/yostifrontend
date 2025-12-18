// src/pages/student/Profile.tsx
import { useState } from "react";
import { Button, Input, Upload, message, Form } from "antd";
import { UploadOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";

interface Student {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  profile_pic?: string;
}

const initialStudent: Student = {
  name: "Tsehaynesh Biruh",
  email: "tsehay@example.com",
  phone: "0912345678",
  address: "123 University St",
  city: "Addis Ababa",
  profile_pic: "",
};

export default function Profile() {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>(student);
  const [profileFile, setProfileFile] = useState<any>(null);

  const handleInputChange = (field: keyof Student, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      message.error("Please fill in all required fields.");
      return;
    }
    setStudent({
      ...student,
      ...formData,
      profile_pic: profileFile ? URL.createObjectURL(profileFile) : student.profile_pic,
    });
    setEditing(false);
    message.success("Profile updated successfully!");
  };

  const inputStyle = {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d9d9d9",
    fontSize: "14px",
    width: "100%",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "56%",
        left: "60%", // more left margin
        transform: "translate(-50%, -50%)",
        width: "950px",
        backgroundColor: "#f7f8fa",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 className="text-xl font-semibold">Profile</h1>
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
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <img
          src={profileFile ? URL.createObjectURL(profileFile) : student.profile_pic || "https://via.placeholder.com/150"}
          alt="Profile"
          style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%", border: "2px solid #0F3952" }}
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
            <Button icon={<UploadOutlined />} block size="small" style={{ marginTop: 8 }}>
              Change Photo
            </Button>
          </Upload>
        )}
      </div>

      {/* Profile Details */}
      <Form layout="vertical" size="small">
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Form.Item label="Full Name" style={{ flex: 1 }}>
            {editing ? (
              <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} style={inputStyle} />
            ) : (
              <span>{student.name}</span>
            )}
          </Form.Item>
          <Form.Item label="Email" style={{ flex: 1 }}>
            {editing ? (
              <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} style={inputStyle} />
            ) : (
              <span>{student.email}</span>
            )}
          </Form.Item>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Form.Item label="Phone" style={{ flex: 1 }}>
            {editing ? (
              <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} style={inputStyle} />
            ) : (
              <span>{student.phone}</span>
            )}
          </Form.Item>
          <Form.Item label="Address" style={{ flex: 1 }}>
            {editing ? (
              <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} style={inputStyle} />
            ) : (
              <span>{student.address}</span>
            )}
          </Form.Item>
          <Form.Item label="City" style={{ flex: 1 }}>
            {editing ? (
              <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} style={inputStyle} />
            ) : (
              <span>{student.city}</span>
            )}
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}
