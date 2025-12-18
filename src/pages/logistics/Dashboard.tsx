
import { Card, Row, Col, Button, List } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, DropboxOutlined, ContainerOutlined } from "@ant-design/icons";

const mockActivities = [
  "Shipment SHP-002 status updated to In Transit",
  "Shipment SHP-003 documents uploaded",
  "Shipment SHP-004 delivered",
  "Shipment SHP-005 booked by Global Express",
];

export default function Dashboard() {
  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.12)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ffffff, #e6f0ff)",
    textAlign: "center" as const,
    padding: "8px", // smaller padding
  };

  const cardNumbers = {
    totalShipments: { count: 128, icon: <DropboxOutlined style={{ fontSize: 22, color: "#0F3952" }} /> },
    inTransit: { count: 42, icon: <ClockCircleOutlined style={{ fontSize: 22, color: "#0F3952" }} /> },
    pendingDocs: { count: 8, icon: <ContainerOutlined style={{ fontSize: 22, color: "#0F3952" }} /> },
    deliveriesDue: { count: 15, icon: <CheckCircleOutlined style={{ fontSize: 22, color: "#0F3952" }} /> },
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <h1 style={{ marginBottom: 20 }}>Logistics Dashboard</h1>

      {/* Top Cards */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {Object.entries(cardNumbers).map(([key, data]) => (
          <Col span={6} key={key}>
            <Card bordered={false} style={cardStyle}>
              <div>{data.icon}</div>
              <h2 style={{ margin: "4px 0", fontSize: 20 }}>{data.count}</h2>
              <p style={{ textTransform: "capitalize", margin: 0, fontSize: 12 }}>{key.replace(/([A-Z])/g, " $1")}</p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Button
            type="primary"
            icon={<ClockCircleOutlined />}
            block
            style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff", height: 36 }}
          >
            Update Status
          </Button>
        </Col>
        <Col span={6}>
          <Button type="default" icon={<CheckCircleOutlined />} block style={{ height: 36 }}>
            Track Containers
          </Button>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity" bordered={false} style={{ borderRadius: "12px", padding: "8px" }}>
        <List
          size="small"
          dataSource={mockActivities}
          renderItem={(item) => <List.Item style={{ padding: "4px 8px" }}>{item}</List.Item>}
        />
      </Card>
    </div>
  );
}
