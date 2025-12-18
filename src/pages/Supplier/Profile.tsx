// src/pages/Supplier/Profile.tsx
import { useState } from "react";
import { Button, Input, Upload, message, Form, Table, Modal, Tag } from "antd";
import { UploadOutlined, EditOutlined, SaveOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface SupplierVerification {
  verification_id: string;
  supplier_id: string;
  concerns: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

interface Supplier {
  supplier_id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  location_city: string;
  location_province: string;
  verified: boolean;
  created_at: string;
  updated_at?: string;
  logo?: string;
}

const initialSupplier: Supplier = {
  supplier_id: "SUP-001",
  name: "ABC Textiles",
  contact_person: "John Doe",
  phone: "0912345678",
  email: "abc@textiles.com",
  address: "123 Main St",
  location_city: "Addis Ababa",
  location_province: "Addis Ababa",
  verified: false,
  created_at: "2025-10-01",
  logo: "",
};

const initialVerifications: SupplierVerification[] = [
  {
    verification_id: "V-001",
    supplier_id: "SUP-001",
    concerns: "Need admin approval for verification",
    status: "Pending",
    created_at: "2025-11-26",
  },
];

export default function SupplierProfile() {
  const [supplier, setSupplier] = useState<Supplier>(initialSupplier);
  const [verifications] = useState<SupplierVerification[]>(initialVerifications); // removed unused setVerifications
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>(supplier);
  const [logoFile, setLogoFile] = useState<any>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const handleInputChange = (field: keyof Supplier, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone);

  const handleSaveProfile = () => {
    if (!formData.name || !formData.contact_person || !formData.email || !formData.phone) {
      message.error("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(formData.email)) {
      message.error("Invalid email format.");
      return;
    }
    if (!validatePhone(formData.phone)) {
      message.error("Invalid phone number (8-15 digits).");
      return;
    }

    setSupplier({
      ...supplier,
      ...formData,
      logo: logoFile ? URL.createObjectURL(logoFile) : supplier.logo,
      updated_at: new Date().toISOString(),
    });
    setEditing(false);
    message.success("Profile updated successfully!");
  };

  const inputStyle = {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d9d9d9",
    fontSize: "13px",
    width: "100%",
  };

  const columns = [
    { title: "Verification ID", dataIndex: "verification_id", key: "verification_id" },
    { title: "Concerns", dataIndex: "concerns", key: "concerns" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "Approved" ? "green" : status === "Rejected" ? "red" : "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any) => (
        <Button icon={<EyeOutlined />} type="link" onClick={() => setViewModalVisible(true)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="px-4 py-2 min-h-screen" style={{ backgroundColor: "#f7f8fa" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 className="text-xl font-semibold">Supplier Profile</h1>
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

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Profile Image */}
        <div style={{ textAlign: "center", maxWidth: 140 }}>
          <img
            src={logoFile ? URL.createObjectURL(logoFile) : supplier.logo || "https://via.placeholder.com/150"}
            alt="Profile Logo"
            style={{ width: 90, height: 90, objectFit: "cover", borderRadius: "50%", border: "2px solid #0F3952" }}
          />
          {editing && (
            <Upload
              beforeUpload={(file) => {
                setLogoFile(file);
                return false;
              }}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} block size="small" style={{ marginTop: 8 }}>
                Change Logo
              </Button>
            </Upload>
          )}
        </div>

        {/* Profile Details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <Form layout="vertical" size="small">
            <Form.Item label="Company Name" required>
              {editing ? <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} style={inputStyle} /> : <span>{supplier.name}</span>}
            </Form.Item>

            {/* Contact Information - Side by Side */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Form.Item label="Contact Person" required>
                  {editing ? <Input value={formData.contact_person} onChange={(e) => handleInputChange("contact_person", e.target.value)} style={inputStyle} /> : <span>{supplier.contact_person}</span>}
                </Form.Item>
              </div>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Form.Item label="Phone" required>
                  {editing ? <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} style={inputStyle} /> : <span>{supplier.phone}</span>}
                </Form.Item>
              </div>
            </div>

            <Form.Item label="Email" required>
              {editing ? <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} style={inputStyle} /> : <span>{supplier.email}</span>}
            </Form.Item>

            <Form.Item label="Address">
              {editing ? <Input value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} style={inputStyle} /> : <span>{supplier.address}</span>}
            </Form.Item>

            {/* Location - Side by Side */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Form.Item label="City">
                  {editing ? <Input value={formData.location_city} onChange={(e) => handleInputChange("location_city", e.target.value)} style={inputStyle} /> : <span>{supplier.location_city}</span>}
                </Form.Item>
              </div>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <Form.Item label="Province">
                  {editing ? <Input value={formData.location_province} onChange={(e) => handleInputChange("location_province", e.target.value)} style={inputStyle} /> : <span>{supplier.location_province}</span>}
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-4 mb-1">Verification Requests</h2>
      <Table
        dataSource={verifications.filter((v) => v.supplier_id === supplier.supplier_id)}
        columns={columns}
        rowKey="verification_id"
        pagination={false}
        bordered
        style={{ backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden" }}
        size="small"
      />

      {/* View Modal */}
      <Modal title="Verification Details" open={viewModalVisible} onCancel={() => setViewModalVisible(false)} footer={null}>
        {verifications.filter((v) => v.supplier_id === supplier.supplier_id).map((v) => (
          <div key={v.verification_id} style={{ marginBottom: 12 }}>
            <p><strong>Verification ID:</strong> {v.verification_id}</p>
            <p><strong>Concerns:</strong> {v.concerns}</p>
            <p><strong>Status:</strong> {v.status}</p>
            <p><strong>Created At:</strong> {dayjs(v.created_at).format("YYYY-MM-DD")}</p>
            <hr />
          </div>
        ))}
      </Modal>
    </div>
  );
}
