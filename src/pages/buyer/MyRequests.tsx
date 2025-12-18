// src/pages/buyer/MyRequests.tsx
import  { useState } from "react";
import { Table, Button, Tag, Drawer, Form, Input, InputNumber, Select, DatePicker, Checkbox, Space } from "antd";
import { EyeOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

interface SourcingRequest {
  request_id: string;
  user_id: string;
  product_name: string;
  description: string;
  quantity: number;
  target_price: number;
  supplier_region: string;
  sample_required: boolean;
  deadline: string;
  status: "open" | "quoted" | "completed";
  created_at: string;
}

const initialRequests: SourcingRequest[] = [
  {
    request_id: "REQ-001",
    user_id: "USR-001",
    product_name: "T-Shirts",
    description: "Cotton t-shirts in multiple colors",
    quantity: 1000,
    target_price: 2.5,
    supplier_region: "Guangzhou",
    sample_required: true,
    deadline: "2025-12-01",
    status: "open",
    created_at: "2025-10-01T10:00:00Z",
  },
  {
    request_id: "REQ-002",
    user_id: "USR-001",
    product_name: "Electronics",
    description: "Portable Bluetooth speakers",
    quantity: 200,
    target_price: 25,
    supplier_region: "Shenzhen",
    sample_required: false,
    deadline: "2025-12-10",
    status: "quoted",
    created_at: "2025-10-05T12:30:00Z",
  },
  {
    request_id: "REQ-003",
    user_id: "USR-001",
    product_name: "Packaging Bags",
    description: "Plastic packaging bags",
    quantity: 5000,
    target_price: 0.05,
    supplier_region: "Yiwu",
    sample_required: false,
    deadline: "2025-11-30",
    status: "completed",
    created_at: "2025-09-20T09:00:00Z",
  },
];

export default function MyRequests() {
  const [requests, setRequests] = useState<SourcingRequest[]>(initialRequests);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [form] = Form.useForm();

  const filteredRequests = statusFilter
    ? requests.filter((r) => r.status === statusFilter)
    : requests;

  const columns = [
    { title: "Product Name", dataIndex: "product_name", key: "product_name", render: (text: string) => <span className="font-semibold text-[#0A1A4E]">{text}</span> },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Target Price ($)", dataIndex: "target_price", key: "target_price" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "open" ? "#FFD700" :
            status === "quoted" ? "#0A1A4E" :
            "#28a745"
          }
          className="text-white font-semibold"
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    { title: "Created At", dataIndex: "created_at", key: "created_at", render: (date: string) => dayjs(date).format("YYYY-MM-DD") },
    { title: "Deadline", dataIndex: "deadline", key: "deadline", render: (date: string) => dayjs(date).format("YYYY-MM-DD") },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: SourcingRequest) => (
        <EyeOutlined
          style={{ color: "#0A1A4E", fontSize: "18px", cursor: "pointer" }}
          onClick={() => { setSelectedRequest(record); setDetailVisible(true); }}
        />
      ),
    },
  ];

  const handleCreate = (values: any) => {
    const newRequest: SourcingRequest = {
      request_id: `REQ-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
      user_id: "USR-001",
      product_name: values.product_name,
      description: values.description,
      quantity: values.quantity,
      target_price: values.target_price,
      supplier_region: values.supplier_region,
      sample_required: values.sample_required,
      deadline: values.deadline.format("YYYY-MM-DD"),
      status: "open",
      created_at: new Date().toISOString(),
    };
    setRequests([newRequest, ...requests]);
    form.resetFields();
    setDrawerVisible(false);
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      {/* Header with Status Filter */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-[#0A1A4E]">My Sourcing Requests</h1>
        <Space>
          {drawerVisible && (
            <Button
              icon={<CloseOutlined />}
              style={{ backgroundColor: "#FFFFFF", color: "#0A1A4E", borderColor: "#0A1A4E", fontWeight: 600 }}
              onClick={() => setDrawerVisible(false)}
            >
              Cancel
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: "#0A1A4E",
              borderColor: "#0A1A4E",
              color: "#FFFFFF",
              fontWeight: 600,
              width: drawerVisible ? 120 : 180,
            }}
            onClick={() => setDrawerVisible(true)}
          >
            Create New Request
          </Button>
        </Space>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "open", "quoted", "completed"].map((status) => (
          <Button
            key={status}
            type={statusFilter === status || (statusFilter === "" && status === "all") ? "primary" : "default"}
            style={{
              backgroundColor: statusFilter === status || (statusFilter === "" && status === "all") ? "#0A1A4E" : "#FFFFFF",
              color: statusFilter === status || (statusFilter === "" && status === "all") ? "#FFD700" : "#0A1A4E",
              borderColor: "#0A1A4E",
              fontWeight: 600,
            }}
            onClick={() => setStatusFilter(status === "all" ? "" : status)}
          >
            {status.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <Table
          dataSource={filteredRequests}
          columns={columns}
          rowKey="request_id"
          pagination={{ pageSize: 5, position: ["bottomRight"] }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Drawer: Create Request */}
      <Drawer
        title="Create New Sourcing Request"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item name="target_price" label="Target Price ($)" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="supplier_region" label="Supplier Region" rules={[{ required: true }]}>
            <Select>
              <Option value="Yiwu">Yiwu</Option>
              <Option value="Guangzhou">Guangzhou</Option>
              <Option value="Shenzhen">Shenzhen</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sample_required" valuePropName="checked">
            <Checkbox>Sample Required</Checkbox>
          </Form.Item>
          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              style={{ backgroundColor: "#0A1A4E", borderColor: "#0A1A4E", color: "#FFFFFF", fontWeight: 600 }}
            >
              Create Request
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer: View Request */}
      <Drawer
        title="Request Details"
        width={400}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {selectedRequest && (
          <div className="space-y-2">
            <p><strong>Request ID:</strong> {selectedRequest.request_id}</p>
            <p><strong>Product Name:</strong> {selectedRequest.product_name}</p>
            <p><strong>Description:</strong> {selectedRequest.description}</p>
            <p><strong>Quantity:</strong> {selectedRequest.quantity}</p>
            <p><strong>Target Price:</strong> ${selectedRequest.target_price}</p>
            <p><strong>Supplier Region:</strong> {selectedRequest.supplier_region}</p>
            <p><strong>Sample Required:</strong> {selectedRequest.sample_required ? "Yes" : "No"}</p>
            <p><strong>Deadline:</strong> {selectedRequest.deadline}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <p><strong>Created At:</strong> {dayjs(selectedRequest.created_at).format("YYYY-MM-DD")}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
