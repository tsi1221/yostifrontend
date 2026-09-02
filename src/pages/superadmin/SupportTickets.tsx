// src/pages/superAdmin/SupportTickets.tsx
import  { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
} from "antd";
import {
  EyeOutlined,
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface SupportTicket {
  support_id: string;
  user_id: string;
  orderReference: string;
  issueType: "defect" | "damage" | "missing" | "other";
  description?: string;
  photoVideoUrl?: string;
  resolutionRequested?: "refund" | "replacement" | "repair";
  urgency?: "low" | "medium" | "high";
  status: "open" | "resolved" | "closed";
  adminNotes?: string;
  created_at?: string;
}

const mockTickets: SupportTicket[] = [
  {
    support_id: "SUP001",
    user_id: "USR001",
    orderReference: "ORD1001",
    issueType: "defect",
    description: "Screen not working",
    photoVideoUrl:
      "https://sample-videos.com/video123/mp4/240/big_buck_bunny_240p_1mb.mp4",
    resolutionRequested: "replacement",
    urgency: "high",
    status: "open",
    adminNotes: "",
    created_at: "2025-11-15",
  },
  {
    support_id: "SUP002",
    user_id: "USR002",
    orderReference: "ORD1002",
    issueType: "damage",
    description: "Box damaged during shipping",
    resolutionRequested: "refund",
    urgency: "medium",
    status: "open",
    adminNotes: "",
    created_at: "2025-11-16",
  },
  {
    support_id: "SUP003",
    user_id: "USR003",
    orderReference: "ORD1003",
    issueType: "missing",
    description: "Item not delivered",
    resolutionRequested: "replacement",
    urgency: "high",
    status: "resolved",
    adminNotes: "Replacement processed",
    created_at: "2025-11-17",
  },
];

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [responseDrawerOpen, setResponseDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicket | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setTickets(mockTickets);
  }, []);

  const handleView = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewDrawerOpen(true);
  };

  const handleRespond = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    form.setFieldsValue({
      status: ticket.status,
      adminNotes: ticket.adminNotes || "",
    });
    setResponseDrawerOpen(true);
  };

  const handleSendResponse = async () => {
    if (!selectedTicket) return;

    try {
      const values = await form.validateFields();

      setTickets((prev) =>
        prev.map((t) =>
          t.support_id === selectedTicket.support_id
            ? { ...t, ...values }
            : t
        )
      );

      message.success("Response sent successfully");
      setResponseDrawerOpen(false);
    } catch (err) {
      message.error("Failed to send response");
    }
  };

  const columns = [
    {
      title: "Support ID",
      dataIndex: "support_id",
    },
    {
      title: "Order Ref",
      dataIndex: "orderReference",
    },
    {
      title: "Issue",
      dataIndex: "issueType",
    },
    {
      title: "Resolution",
      dataIndex: "resolutionRequested",
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      render: (value: string) => {
        const color =
          value === "high" ? "volcano" : value === "medium" ? "gold" : "green";
        return <Tag color={color}>{value.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: string) => {
        const color =
          value === "open"
            ? "red"
            : value === "resolved"
            ? "green"
            : "default";
        return <Tag color={color}>{value.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      render: (_: any, record: SupportTicket) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<MessageOutlined />}
            style={{ color: "#0f3952" }}
            onClick={() => handleRespond(record)}
          >
            Respond
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        fontFamily: "Segoe UI, sans-serif",
        maxWidth: 1300,
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#0F3952",
          marginBottom: 24,
        }}
      >
        Support 
      </h2>

      <Table
        dataSource={tickets}
        columns={columns}
        rowKey="support_id"
        bordered
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />

      {/* VIEW DETAILS DRAWER */}
      <Drawer
        title={`Ticket Details`}
        width={window.innerWidth < 768 ? "100%" : 450}
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        bodyStyle={{ padding: 16 }}
      >
        {selectedTicket && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <p><strong>User:</strong> {selectedTicket.user_id}</p>
            <p><strong>Order Ref:</strong> {selectedTicket.orderReference}</p>
            <p><strong>Issue:</strong> {selectedTicket.issueType}</p>
            <p><strong>Description:</strong> {selectedTicket.description}</p>

            {selectedTicket.photoVideoUrl && (
              <div>
                <strong>Attachment:</strong>
                <video width="100%" controls style={{ marginTop: 8 }}>
                  <source
                    src={selectedTicket.photoVideoUrl}
                    type="video/mp4"
                  />
                </video>
              </div>
            )}

            <p><strong>Resolution:</strong> {selectedTicket.resolutionRequested}</p>
            <p><strong>Urgency:</strong> {selectedTicket.urgency}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            <p><strong>Admin Notes:</strong> {selectedTicket.adminNotes}</p>
          </Space>
        )}
      </Drawer>

      {/* RESPONSE DRAWER */}
      <Drawer
        title={`Respond to Ticket`}
        width={window.innerWidth < 768 ? "100%" : 450}
        open={responseDrawerOpen}
        onClose={() => setResponseDrawerOpen(false)}
        bodyStyle={{ padding: 16 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Update Status"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select new status">
              <Option value="open">Open</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Form.Item>

          <Form.Item name="adminNotes" label="Admin Response">
            <Input.TextArea rows={4} placeholder="Write your response..." />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              icon={<CloseOutlined />}
              onClick={() => setResponseDrawerOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              icon={<SendOutlined />}
              style={{ background: "#0F3952", borderColor: "#0F3952" }}
              onClick={handleSendResponse}
            >
              Send Response
            </Button>
          </Space>
        </Form>
      </Drawer>
    </div>
  );
}
