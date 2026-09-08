import React, { useState } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Button,
  Table,
  Tag,
  Progress,
  Drawer,
  Form,
  Input,
  InputNumber,
  Statistic,
  Space,
  Checkbox,
  message,
  Modal,
  Grid,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useBuyerDashboard } from "../../VisitorPublicUser/hooks/useBuyerDashboard";
import type { SourcingRequest, CreateSourcingPayload } from "./sourcing";

const { Content } = Layout;

// Status UI styles
const statusStyles: Record<
  string,
  { borderColor: string; background: string; tagColor: string }
> = {
  open: { borderColor: "#1677ff", background: "#f0f7ff", tagColor: "blue" },
  closed: { borderColor: "#52c41a", background: "#f6ffed", tagColor: "green" },
  cancelled: { borderColor: "#ff4d4f", background: "#fff1f0", tagColor: "red" },
  default: { borderColor: "#d9d9d9", background: "#ffffff", tagColor: "default" },
};

// Define stats keys explicitly for type safety
type StatsKey = "activeRequests" | "shipmentsInTransit" | "pendingInspections";

const Dashboard: React.FC = () => {
  const { requests = [], shipments = [], stats, loading, createSourcingRequest } =
    useBuyerDashboard();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<SourcingRequest | null>(null);
  const [form] = Form.useForm<CreateSourcingPayload>();

  const handleCreate = async (values: CreateSourcingPayload) => {
    try {
      await createSourcingRequest(values);
      message.success("Sourcing request created successfully");
      form.resetFields();
      setCreateOpen(false);
    } catch {
      message.error("Failed to create sourcing request");
    }
  };

  const statKeys: StatsKey[] = ["activeRequests", "shipmentsInTransit", "pendingInspections"];

  return (
    <Layout style={{ minHeight: "100vh", background: "#F4F7FE" }}>
      <Content style={{ padding: isMobile ? 12 : 24 }}>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{
            marginBottom: 24,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 12 : 0,
          }}
        >
          <Col>
            <h2>Buyer Control Panel</h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block={isMobile}
              onClick={() => setCreateOpen(true)}
            >
              New Sourcing
            </Button>
          </Col>
        </Row>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statKeys.map((key) => (
            <Col key={key} xs={24} sm={8}>
              <Card>
                <Statistic
                  title={
                    key === "activeRequests"
                      ? "Active Requests"
                      : key === "shipmentsInTransit"
                      ? "Shipments In Transit"
                      : "Pending Inspections"
                  }
                  value={stats?.[key] ?? 0}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Shipments */}
          <Col xs={24} lg={16}>
            <Card title="Shipment Tracker">
              {isMobile ? (
                <Space direction="vertical" style={{ width: "100%" }}>
                  {shipments.length === 0 && !loading && <Card>No shipments yet</Card>}
                  {shipments.map((s) => (
                    <Card key={s._id} size="small" bordered hoverable>
                      <div className="flex justify-between items-center mb-2">
                        <strong>{s.trackingId || "Pending"}</strong>
                        <Tag color={s.status === "In Transit" ? "orange" : "green"}>
                          {s.status}
                        </Tag>
                      </div>
                      <Progress percent={s.progress} size="small" />
                    </Card>
                  ))}
                </Space>
              ) : (
                <Table
                  loading={loading}
                  rowKey={(record) => record._id}
                  dataSource={shipments}
                  pagination={false}
                  columns={[
                    { title: "Tracking ID", dataIndex: "trackingId", render: (v?: string) => v || "Pending" },
                    {
                      title: "Status",
                      dataIndex: "status",
                      render: (s: string) => <Tag color={s === "In Transit" ? "orange" : "green"}>{s}</Tag>,
                    },
                    { title: "Progress", dataIndex: "progress", render: (p: number) => <Progress percent={p} size="small" /> },
                  ]}
                  scroll={{ x: 600 }}
                />
              )}
            </Card>
          </Col>

          {/* Requests */}
          <Col xs={24} lg={8}>
            <Card title="Latest Requests">
              <Space direction="vertical" style={{ width: "100%" }}>
                {requests.length === 0 && !loading && <Card size="small">No requests yet</Card>}
                {requests.map((req) => {
                  const style = statusStyles[req.status] ?? statusStyles.default;
                  return (
                    <Card
                      key={req._id}
                      hoverable
                      size="small"
                      onClick={() => setSelectedReq(req)}
                      style={{
                        borderLeft: `4px solid ${style.borderColor}`,
                        background: style.background,
                        cursor: "pointer",
                      }}
                    >
                      <strong>{req.productName}</strong>
                      <br />
                      <Tag color={style.tagColor}>{req.status}</Tag>
                    </Card>
                  );
                })}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Create Drawer */}
        <Drawer
          title="Create Sourcing Request"
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          width={isMobile ? "100%" : 420}
        >
          <Form layout="vertical" form={form} onFinish={handleCreate}>
            <Form.Item name="productName" label="Product Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="targetPrice" label="Target Price" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="supplierRegion" label="Supplier Region" initialValue="Any">
              <Input />
            </Form.Item>
            <Form.Item name="sampleRequired" valuePropName="checked" initialValue={false}>
              <Checkbox>Sample required</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Request
            </Button>
          </Form>
        </Drawer>

        {/* Details Modal */}
        <Modal
          title="Request Details"
          open={Boolean(selectedReq)}
          onCancel={() => setSelectedReq(null)}
          footer={null}
          width={isMobile ? "100%" : 520}
        >
          {selectedReq && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Statistic title="Status" value={selectedReq.status} />
              <p>{selectedReq.description}</p>
              <Statistic title="Quantity" value={selectedReq.quantity} />
              <Statistic title="Target Price" value={`$${selectedReq.targetPrice}`} />
              <Statistic title="Region" value={selectedReq.supplierRegion} />
            </Space>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default Dashboard;
