// src/components/SupportBuyer/SupportBuyer.tsx
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
  Typography,
  Space,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useSupportBuyer, type SupportRequest } from "../../hooks/useSupportBuyer";

const { Title } = Typography;

/* -------------------- Types -------------------- */

interface SupportFormValues {
  orderReference: string;
  issueType: "defect" | "damage" | "missing" | "other";
  description: string;
  resolutionRequested: "refund" | "replacement" | "repair";
  urgency: "low" | "medium" | "high";
}

/* -------------------- Components -------------------- */

const StatusTag = ({ status }: { status: SupportRequest["status"] }) => {
  const colorMap: Record<SupportRequest["status"], string> = {
    OPEN: "orange",
    RESOLVED: "blue",
    CLOSED: "green",
  };

  return <Tag color={colorMap[status]}>{status}</Tag>;
};

/* -------------------- Page -------------------- */

export default function SupportBuyer() {
  const { requests, loading, submitRequest } = useSupportBuyer(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [form] = Form.useForm<SupportFormValues>();

  const handleSubmit = async (values: SupportFormValues): Promise<void> => {
    try {
      await submitRequest(values);
      message.success("Support request submitted");
      form.resetFields();
      setDrawerOpen(false);
    } catch {
      message.error("Failed to submit support request");
    }
  };

  const columns: ColumnsType<SupportRequest> = [
    {
      title: "Order Ref",
      dataIndex: "orderReference",
      key: "orderReference",
    },
    {
      title: "Issue Type",
      dataIndex: "issueType",
      key: "issueType",
      render: (type: SupportRequest["issueType"]) =>
        type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency: SupportRequest["urgency"]) =>
        urgency.charAt(0).toUpperCase() + urgency.slice(1),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SupportRequest["status"]) => (
        <StatusTag status={status} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* ---------- Header ---------- */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Support Requests
          </Title>
        </Col>

        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            New Support Request
          </Button>
        </Col>
      </Row>

      {/* ---------- Table ---------- */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={requests}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* ---------- Drawer ---------- */}
      <Drawer
        title="New Support Request"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="orderReference"
            label="Order Reference"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="issueType"
            label="Issue Type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="defect">Defect</Select.Option>
              <Select.Option value="damage">Damage</Select.Option>
              <Select.Option value="missing">Missing</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="resolutionRequested"
            label="Resolution Requested"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="refund">Refund</Select.Option>
              <Select.Option value="replacement">Replacement</Select.Option>
              <Select.Option value="repair">Repair</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="urgency"
            label="Urgency"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
