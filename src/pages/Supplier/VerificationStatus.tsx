// src/pages/supplier/OpenRequests.tsx
import  { useState } from "react";
import { Table, Button, Drawer, Input, Upload, message, Modal, Form } from "antd";
import { UploadOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface SupplierVerification {
  verification_id: string;
  supplier_id: string;
  requester_name: string;
  concerns: string;
  status: "Pending" | "Approved" | "Rejected";
  turnaround_time?: string;
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
  updated_at: string;
  logo?: string;
}

const initialSuppliers: Supplier[] = [
  {
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
    updated_at: "2025-10-01",
  },
];

const initialVerifications: SupplierVerification[] = [
  {
    verification_id: "V-001",
    supplier_id: "SUP-001",
    requester_name: "John Doe",
    concerns: "Need admin approval for verification",
    status: "Pending",
    turnaround_time: "3 days",
    created_at: "2025-11-26",
  },
];

export default function VerificationStatus() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [verifications, setVerifications] = useState<SupplierVerification[]>(initialVerifications);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    location_city: "",
    location_province: "",
  });
  const [concerns, setConcerns] = useState("");
  const [logoFile, setLogoFile] = useState<any>(null);

  const handleInputChange = (field: keyof Supplier, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{8,15}$/.test(phone);

  const handleSubmitRequest = () => {
    if (!formData.name || !formData.contact_person || !formData.email || !formData.phone) {
      message.error("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(formData.email)) {
      message.error("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(formData.phone)) {
      message.error("Please enter a valid phone number (8-15 digits).");
      return;
    }

    if (editingSupplierId) {
      // Edit existing supplier
      setSuppliers((prev) =>
        prev.map((s) =>
          s.supplier_id === editingSupplierId
            ? {
                ...s,
                ...formData,
                logo: logoFile ? URL.createObjectURL(logoFile) : s.logo,
                updated_at: new Date().toISOString(),
              }
            : s
        )
      );
      message.success("Supplier details updated!");
      setEditingSupplierId(null);
    } else {
      // Add new supplier
      const newSupplierId = `SUP-${(suppliers.length + 1).toString().padStart(3, "0")}`;
      const newSupplier: Supplier = {
        supplier_id: newSupplierId,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        logo: logoFile ? URL.createObjectURL(logoFile) : undefined,
        ...formData,
      } as Supplier;
      setSuppliers((prev) => [...prev, newSupplier]);

      const newVerification: SupplierVerification = {
        verification_id: `V-${(verifications.length + 1).toString().padStart(3, "0")}`,
        supplier_id: newSupplierId,
        requester_name: formData.contact_person || "",
        concerns,
        status: "Pending",
        created_at: new Date().toISOString(),
      };
      setVerifications((prev) => [...prev, newVerification]);

      message.success("Verification request submitted!");
    }

    setFormData({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      location_city: "",
      location_province: "",
    });
    setConcerns("");
    setLogoFile(null);
    setDrawerVisible(false);
  };

  const handleViewDetails = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.supplier_id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      setViewModalVisible(true);
    }
  };

  const handleEdit = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.supplier_id === supplierId);
    if (supplier) {
      setFormData(supplier);
      setLogoFile(null);
      setEditingSupplierId(supplierId);
      setDrawerVisible(true);
    }
  };

  const columns = [
    { title: "Verification ID", dataIndex: "verification_id", key: "verification_id" },
    { title: "Supplier ID", dataIndex: "supplier_id", key: "supplier_id" },
    { title: "Requester", dataIndex: "requester_name", key: "requester_name" },
    { title: "Concerns", dataIndex: "concerns", key: "concerns" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "Approved" ? "green" : status === "Rejected" ? "red" : "gold";
        return <span style={{ color }}>{status}</span>;
      },
    },
    { title: "Created At", dataIndex: "created_at", key: "created_at", render: (d: string) => dayjs(d).format("YYYY-MM-DD") },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: SupplierVerification) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} type="link" onClick={() => handleViewDetails(record.supplier_id)}>
            View
          </Button>
          <Button icon={<EditOutlined />} type="link" onClick={() => handleEdit(record.supplier_id)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 20 }}>
        <h1 className="text-2xl font-semibold">Open Verification Requests</h1>
        <Button
          type="primary"
          style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff" }}
          onClick={() => {
            setEditingSupplierId(null);
            setFormData({
              name: "",
              contact_person: "",
              phone: "",
              email: "",
              address: "",
              location_city: "",
              location_province: "",
            });
            setLogoFile(null);
            setDrawerVisible(true);
          }}
        >
         Verification Request
        </Button>
      </div>

      <Table dataSource={verifications} columns={columns} rowKey="verification_id" pagination={{ pageSize: 5 }} bordered />

      {/* Drawer */}
      <Drawer
        title={editingSupplierId ? "Edit Supplier" : "Submit Verification Request"}
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: "24px" }}
      >
        <Form layout="vertical">
          <Form.Item label="Company Name" required>
            <Input placeholder="Company Name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
          </Form.Item>
          <Form.Item label="Contact Person" required>
            <Input placeholder="Contact Person" value={formData.contact_person} onChange={(e) => handleInputChange("contact_person", e.target.value)} />
          </Form.Item>
          <Form.Item label="Phone" required>
            <Input placeholder="Phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input placeholder="Email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
          </Form.Item>
          <Form.Item label="Address">
            <Input placeholder="Address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
          </Form.Item>
          <Form.Item label="City">
            <Input placeholder="City" value={formData.location_city} onChange={(e) => handleInputChange("location_city", e.target.value)} />
          </Form.Item>
          <Form.Item label="Province">
            <Input placeholder="Province" value={formData.location_province} onChange={(e) => handleInputChange("location_province", e.target.value)} />
          </Form.Item>
          <Form.Item label="Concerns / Notes">
            <Input.TextArea rows={3} value={concerns} onChange={(e) => setConcerns(e.target.value)} />
          </Form.Item>
          <Form.Item label="Company Logo">
            <Upload beforeUpload={(file) => { setLogoFile(file); return false; }} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Upload Company Logo</Button>
            </Upload>
            {logoFile && <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" style={{ width: "100%", marginTop: 12 }} />}
          </Form.Item>
          <Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="primary" style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff" }} onClick={handleSubmitRequest}>
                {editingSupplierId ? "Update" : "Submit"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      {/* View Modal */}
      <Modal title="Supplier Details" open={viewModalVisible} onCancel={() => setViewModalVisible(false)} footer={null}>
        {selectedSupplier && (
          <div>
            {selectedSupplier.logo && <img src={selectedSupplier.logo} alt="Company Logo" style={{ width: "100%", marginBottom: 16 }} />}
            <p><strong>Company Name:</strong> {selectedSupplier.name}</p>
            <p><strong>Contact Person:</strong> {selectedSupplier.contact_person}</p>
            <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
            <p><strong>Email:</strong> {selectedSupplier.email}</p>
            <p><strong>Address:</strong> {selectedSupplier.address}</p>
            <p><strong>City:</strong> {selectedSupplier.location_city}</p>
            <p><strong>Province:</strong> {selectedSupplier.location_province}</p>
            <p><strong>Verified:</strong> {selectedSupplier.verified ? "Yes" : "No"}</p>
            <p><strong>Created At:</strong> {dayjs(selectedSupplier.created_at).format("YYYY-MM-DD")}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
