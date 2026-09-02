// src/pages/buyer/MyRequests.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Tag,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Checkbox,
  Space,
  message,
} from "antd";
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

export default function MyRequests() {
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SourcingRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const token = localStorage.getItem("token") || "";
  const API_BASE = "http://localhost:5000"; // <- Make sure this points to your backend

  // Fetch buyer requests from backend
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/sourcing/myrequests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend must return array of requests
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

  // Create new request
  const handleCreate = async (values: any) => {
    try {
      const payload = {
        productName: values.product_name,
        description: values.description,
        quantity: values.quantity,
        targetPrice: values.target_price,
        supplierRegion: values.supplier_region,
        sampleRequired: values.sample_required,
        deadline: values.deadline.format("YYYY-MM-DD"),
      };

      await axios.post(`${API_BASE}/api/sourcing`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      form.resetFields();
      setDrawerVisible(false);
      message.success("Sourcing request created successfully!");

      // Fetch fresh requests to display the new one
      fetchRequests();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to create request");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white">
      {/* Header */}
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <Table
          dataSource={requests}
          columns={columns}
          rowKey="request_id"
          pagination={{ pageSize: 5, position: ["bottomRight"] }}
          scroll={{ x: "max-content" }}
          loading={loading}
        />
      </div>

      {/* Drawer: Create */}
      <Drawer
        title="Create New Sourcing Request"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
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

      {/* Drawer: View */}
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
