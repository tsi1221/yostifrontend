import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  message,
  Card,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import { EyeOutlined, PlusOutlined, CustomerServiceOutlined} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

const brandBlue = "#001F54";
const brandLightBlue = "#E6F0FF";
const hoverYellow = "#FFD700";

// Status badge component
const StatusTag = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; text: string }> = {
    OPEN: { color: "orange", text: "Open" },
    RESOLVED: { color: "blue", text: "Resolved" },
    CLOSED: { color: "green", text: "Closed" },
  };
  const config = statusConfig[status] || { color: "default", text: status };
  return <Tag color={config.color}>{config.text}</Tag>;
};

// Urgency tag component
const UrgencyTag = ({ urgency }: { urgency: string }) => {
  const urgencyConfig: Record<string, { color: string }> = {
    high: { color: "red" },
    medium: { color: "orange" },
    low: { color: "green" },
  };
  const config = urgencyConfig[urgency] || { color: "default" };
  return (
    <Tag color={config.color} style={{ textTransform: "capitalize" }}>
      {urgency}
    </Tag>
  );
};

// Issue type tag component
const IssueTypeTag = ({ type }: { type: string }) => {
  const typeConfig: Record<string, { color: string; text: string }> = {
    defect: { color: "volcano", text: "Defect" },
    damage: { color: "red", text: "Damage" },
    missing: { color: "gold", text: "Missing" },
    other: { color: "default", text: "Other" },
  };
  const config = typeConfig[type] || { color: "default", text: type };
  return <Tag color={config.color}>{config.text}</Tag>;
};

interface SupportRequest {
  support_id: string;
  user_id: string;
  order_reference: string;
  issue_type: "defect" | "damage" | "missing" | "other";
  description: string;
  resolution_requested: "refund" | "replacement" | "repair";
  urgency: "low" | "medium" | "high";
  status: "OPEN" | "RESOLVED" | "CLOSED";
  issue: string;
  created_at: string;
  updated_at: string;
}

interface SupportDetail extends SupportRequest {
  customer_name: string;
  customer_email: string;
  order_date: string;
  product_details: string;
  support_agent?: string;
}

export default function Support() {
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED" | "CLOSED">("ALL");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [, setSelectedRequest] = useState<SupportDetail | null>(null);
  const [form] = Form.useForm();
  const [requests, setRequests] = useState<SupportRequest[]>([
    {
      support_id: "SUP-001",
      user_id: "USR-001",
      issue: "Damaged Product",
      order_reference: "ORD-12221",
      issue_type: "damage",
      description: "The product arrived with visible damage on the packaging and the item itself has scratches.",
      resolution_requested: "replacement",
      urgency: "high",
      status: "OPEN",
      created_at: "2025-10-01",
      updated_at: "2025-10-01"
    },
    {
      support_id: "SUP-002",
      user_id: "USR-002",
      issue: "Missing Items",
      order_reference: "ORD-99887",
      issue_type: "missing",
      description: "Two items from my order are missing from the delivery package.",
      resolution_requested: "refund",
      urgency: "medium",
      status: "RESOLVED",
      created_at: "2025-10-10",
      updated_at: "2025-10-12"
    },
    {
      support_id: "SUP-003",
      user_id: "USR-003",
      issue: "Wrong Product Sent",
      order_reference: "ORD-45321",
      issue_type: "defect",
      description: "Received a different product than what I ordered. The model number doesn't match.",
      resolution_requested: "replacement",
      urgency: "low",
      status: "CLOSED",
      created_at: "2025-09-28",
      updated_at: "2025-10-05"
    },
  ]);

  const filteredRequests = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  const handleViewDetails = (record: SupportRequest) => {
    const detail: SupportDetail = {
      ...record,
      customer_name: "Customer Name",
      customer_email: "customer@email.com",
      order_date: "2025-01-01",
      product_details: "Product Details"
    };
    setSelectedRequest(detail);
    setDrawerVisible(true);
  };

  const generateSupportId = () => {
    const nextId = requests.length + 1;
    return `SUP-${nextId.toString().padStart(3, "0")}`;
  };

  const handleSubmitRequest = async (values: any) => {
    const newRequest: SupportRequest = {
      support_id: generateSupportId(),
      user_id: `USR-${(requests.length + 1).toString().padStart(3, "0")}`,
      issue: values.issue,
      order_reference: values.order_reference,
      issue_type: values.issue_type,
      description: values.description,
      resolution_requested: values.resolution_requested,
      urgency: values.urgency,
      status: "OPEN",
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [newRequest, ...prev]);
    message.success("Support request submitted successfully!");
    setDrawerVisible(false);
    form.resetFields();
  };

  const columns: ColumnsType<SupportRequest> = [
    {
      title: "Support ID",
      dataIndex: "support_id",
      key: "support_id",
      width: 100,
      render: (id: string) => <Text strong style={{ color: brandBlue, fontSize: "12px" }}>{id}</Text>,
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
      render: (issue: string, record: SupportRequest) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 2, fontSize: "13px" }}>{issue}</div>
          <IssueTypeTag type={record.issue_type} />
        </div>
      ),
    },
    {
      title: "Order Ref",
      dataIndex: "order_reference",
      key: "order_reference",
      width: 100,
      render: (text: string) => <Text style={{ fontSize: "12px" }}>{text}</Text>,
    },
    {
      title: "Resolution",
      dataIndex: "resolution_requested",
      key: "resolution_requested",
      width: 100,
      render: (resolution: string) => (
        <span style={{ textTransform: "capitalize", fontSize: "12px" }}>{resolution}</span>
      ),
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      width: 90,
      render: (urgency: string) => <UrgencyTag urgency={urgency} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          style={{ color: brandBlue, transition: "all 0.3s ease" }}
          className="view-detail-btn"
          onClick={() => handleViewDetails(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <style>
        {`
          .view-detail-btn:hover {
            color: ${hoverYellow} !important;
            transform: scale(1.1);
          }
        `}
      </style>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ color: brandBlue, margin: 0 }}>
            <CustomerServiceOutlined style={{ marginRight: 12 }} />
            Support Requests
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ backgroundColor: brandBlue, borderColor: brandBlue }}
            onClick={() => setDrawerVisible(true)}
          >
            Request Support
          </Button>
        </Col>
      </Row>

      {/* FILTER TABS */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Space size="middle">
          {["ALL", "OPEN", "RESOLVED", "CLOSED"].map((tab) => (
            <Button
              key={tab}
              type={filter === tab ? "primary" : "default"}
              onClick={() => setFilter(tab as any)}
            >
              {tab}
            </Button>
          ))}
        </Space>
      </Card>

      {/* TABLE */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="support_id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 700 }}
          size="small"
        />
      </Card>

      {/* SUPPORT REQUEST DRAWER */}
      <Drawer
        title={<Text strong style={{ color: brandBlue }}>New Support Request</Text>}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
        bodyStyle={{ paddingBottom: 80 }}
        headerStyle={{ borderBottom: `1px solid ${brandLightBlue}` }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitRequest} requiredMark="optional">
          <Form.Item name="order_reference" label="Order Reference" rules={[{ required: true }]}>
            <Input placeholder="e.g., ORD-12345" size="small" />
          </Form.Item>
          <Form.Item name="issue_type" label="Issue Type" rules={[{ required: true }]}>
            <Select placeholder="Select issue type" size="small">
              <Select.Option value="defect">Defect</Select.Option>
              <Select.Option value="damage">Damage</Select.Option>
              <Select.Option value="missing">Missing</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="issue" label="Issue Title" rules={[{ required: true }]}>
            <Input placeholder="Brief description of the issue" size="small" />
          </Form.Item>
          <Form.Item name="description" label="Detailed Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Provide detailed info..." size="small" />
          </Form.Item>
          <Form.Item name="resolution_requested" label="Resolution Requested" rules={[{ required: true }]}>
            <Select placeholder="Select resolution" size="small">
              <Select.Option value="refund">Refund</Select.Option>
              <Select.Option value="replacement">Replacement</Select.Option>
              <Select.Option value="repair">Repair</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="urgency" label="Urgency Level" rules={[{ required: true }]}>
            <Select placeholder="Select urgency" size="small">
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setDrawerVisible(false)} size="small">Cancel</Button>
              <Button type="primary" htmlType="submit" size="small" style={{ backgroundColor: brandBlue, borderColor: brandBlue }}>
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
