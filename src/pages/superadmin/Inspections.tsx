// src/pages/superAdmin/AllInspections.tsx
import { useState, useEffect } from "react";
import {
  Table,
  Drawer,
  Form,
  Input,
  Button,
  Upload,
  Select,
  Space,
  Tag,
  message,
  DatePicker,
  Modal,
} from "antd";
import { UploadOutlined, SaveOutlined, CloseOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Inspection {
  inspection_id: string;
  user_id: string;
  supplier_id: string;
  product_type: string;
  inspection_type: "sample" | "pre-shipment" | "factory visit";
  date: string;
  status: "pending" | "completed" | "rejected";
  remarks?: string;
  photo_video_required: boolean;
  reportUrl?: string;
}

const mockInspections: Inspection[] = [
  {
    inspection_id: "1",
    user_id: "USR001",
    supplier_id: "SUP001",
    product_type: "Coffee",
    inspection_type: "sample",
    date: "2025-11-15",
    status: "pending",
    remarks: "",
    photo_video_required: true,
    reportUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    inspection_id: "2",
    user_id: "USR002",
    supplier_id: "SUP002",
    product_type: "Spices",
    inspection_type: "pre-shipment",
    date: "2025-11-14",
    status: "completed",
    remarks: "Passed all checks",
    photo_video_required: false,
    reportUrl: "report2.pdf",
  },
];

const AllInspections: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [activeFilter, setActiveFilter] = useState<Inspection["inspection_type"] | "all">("all");

  useEffect(() => {
    setInspections(mockInspections);
    setFilteredInspections(mockInspections);
  }, []);

  const filterByType = (type: Inspection["inspection_type"] | "all") => {
    setActiveFilter(type);
    setFilteredInspections(type === "all" ? inspections : inspections.filter(i => i.inspection_type === type));
  };

  const handleView = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    setViewDrawerOpen(true);
  };

  const handleEdit = (inspection: Inspection) => {
    setSelectedInspection(inspection);
    form.setFieldsValue({
      ...inspection,
      date: inspection.date ? new Date(inspection.date) : null,
    });
    setFormDrawerOpen(true);
  };

  const handleDelete = (inspectionId: string) => {
    Modal.confirm({
      title: "Delete Inspection",
      content: "Are you sure you want to delete this inspection?",
      onOk: () => {
        setInspections(prev => prev.filter(i => i.inspection_id !== inspectionId));
        setFilteredInspections(prev => prev.filter(i => i.inspection_id !== inspectionId));
        message.success("Inspection deleted successfully");
      },
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const uploadedFile = values.reportUrl?.[0]?.originFileObj
        ? URL.createObjectURL(values.reportUrl[0].originFileObj)
        : selectedInspection?.reportUrl;

      if (selectedInspection) {
        // Edit
        const updated = { ...selectedInspection, ...values, reportUrl: uploadedFile };
        setInspections(prev => prev.map(i => i.inspection_id === selectedInspection.inspection_id ? updated : i));
        setFilteredInspections(prev => prev.map(i => i.inspection_id === selectedInspection.inspection_id ? updated : i));
        message.success("Inspection updated successfully");
      } else {
        // Add
        const newInspection: Inspection = {
          inspection_id: `INS${inspections.length + 1}`,
          ...values,
          reportUrl: uploadedFile,
        } as Inspection;
        setInspections(prev => [...prev, newInspection]);
        setFilteredInspections(prev => [...prev, newInspection]);
        message.success("Inspection added successfully");
      }

      setFormDrawerOpen(false);
      setSelectedInspection(null);
      form.resetFields();
    } catch {
      message.error("Failed to save inspection");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Product", dataIndex: "product_type", key: "product_type" },
    { title: "Type", dataIndex: "inspection_type", key: "inspection_type" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "pending" ? "orange" : status === "completed" ? "green" : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Inspection) => (
        <Space>
          <Button
            type="primary"
            style={{ background: "#0F3952", color: "#FFFFFF" }}
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="default"
            style={{ background: "#FFD700", color: "#0F3952" }}
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="default"
            style={{ background: "#FF4D4F", color: "#FFFFFF" }}
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.inspection_id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ color: "#0F3952", fontSize: 22, marginBottom: 16 }}>Request Quality Inspections</h2>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }}>
        {(["all", "sample", "pre-shipment", "factory visit"] as const).map(type => (
          <Button
            key={type}
            type={activeFilter === type ? "primary" : "default"}
            style={{
              background: activeFilter === type ? "#0F3952" : "#FFFFFF",
              color: activeFilter === type ? "#FFD700" : "#0F3952",
              borderColor: "#0F3952",
              fontWeight: 600,
            }}
            onClick={() => filterByType(type)}
          >
            {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </Space>

      {/* Request Inspection Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#0F3952", borderColor: "#0F3952", color: "#FFFFFF", marginLeft: 16 }}
          onClick={() => { setSelectedInspection(null); form.resetFields(); setFormDrawerOpen(true); }}
        >
          Request Inspection
        </Button>
      </div>

      <Table dataSource={filteredInspections} columns={columns} rowKey="inspection_id" pagination={{ pageSize: 5 }} />

      {/* View Drawer */}
      <Drawer
        title="Inspection Details"
        width={450}
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        bodyStyle={{ backgroundColor: "#FFFFFF" }}
      >
        {selectedInspection && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <p><strong>User ID:</strong> {selectedInspection.user_id}</p>
            <p><strong>Supplier ID:</strong> {selectedInspection.supplier_id}</p>
            <p><strong>Product Type:</strong> {selectedInspection.product_type}</p>
            <p><strong>Inspection Type:</strong> {selectedInspection.inspection_type}</p>
            <p><strong>Date:</strong> {selectedInspection.date}</p>
            <p><strong>Status:</strong> {selectedInspection.status.toUpperCase()}</p>
            <p><strong>Remarks:</strong> {selectedInspection.remarks || "N/A"}</p>
            <p>
              <strong>Photo/Video Required:</strong>{" "}
              {selectedInspection.photo_video_required
                ? selectedInspection.reportUrl
                  ? <video width="100%" controls style={{ marginTop: 8 }}>
                      <source src={selectedInspection.reportUrl} type="video/mp4" />
                    </video>
                  : "Yes"
                : "No"}
            </p>
          </Space>
        )}
      </Drawer>

      {/* Add/Edit Drawer */}
      <Drawer
        title={selectedInspection ? "Edit Inspection" : "Request Inspection"}
        width={450}
        open={formDrawerOpen}
        onClose={() => setFormDrawerOpen(false)}
        bodyStyle={{ backgroundColor: "#FFFFFF" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="supplier_id" label="Supplier ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_type" label="Product Type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="inspection_type" label="Inspection Type" rules={[{ required: true }]}>
            <Select>
              <Option value="sample">Sample</Option>
              <Option value="pre-shipment">Pre-Shipment</Option>
              <Option value="factory visit">Factory Visit</Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="photo_video_required" label="Photo/Video Required" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reportUrl"
            label="Upload Report / Video"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => e?.fileList}
          >
            <Upload name="report" listType="text" maxCount={1}>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }} size="middle">
            <Button
              icon={<CloseOutlined />}
              onClick={() => setFormDrawerOpen(false)}
              style={{ border: "1px solid #0F3952", color: "#0F3952", borderRadius: 6 }}
            >
              Cancel
            </Button>
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={handleSave}
              loading={loading}
              style={{ background: "#0F3952", border: "none", borderRadius: 6 }}
            >
              {selectedInspection ? "Update" : "Add"}
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
};

export default AllInspections;
