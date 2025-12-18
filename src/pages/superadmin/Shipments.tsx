// src/pages/superAdmin/Shipments.tsx
import  { useState, useEffect } from "react";
import {
  Table,
  Drawer,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Form,
  InputNumber,
  DatePicker,
} from "antd";
import { EyeOutlined, UserSwitchOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Shipment {
  shipment_id: string;
  user_id: string;
  pickup_location: string;
  destination_country: string;
  destination_city: string;
  goods_description: string;
  weight: number;
  volume: number;
  shipping_method: "sea" | "air" | "express";
  tracking_number: string;
  status: "booked" | "in transit" | "at port" | "customs" | "delivered";
  estimated_delivery_date?: string;
  created_at: string;
  assigned_logistic?: string;
}

const mockShipments: Shipment[] = [
  {
    shipment_id: "SHP001",
    user_id: "USR001",
    pickup_location: "Addis Ababa",
    destination_country: "USA",
    destination_city: "New York",
    goods_description: "Electronics",
    weight: 150,
    volume: 1.2,
    shipping_method: "air",
    tracking_number: "TRK001",
    status: "in transit",
    estimated_delivery_date: "2025-12-05",
    created_at: "2025-11-15",
  },
  {
    shipment_id: "SHP002",
    user_id: "USR002",
    pickup_location: "Bahir Dar",
    destination_country: "Germany",
    destination_city: "Berlin",
    goods_description: "Textiles",
    weight: 500,
    volume: 3,
    shipping_method: "sea",
    tracking_number: "TRK002",
    status: "booked",
    estimated_delivery_date: "2025-12-20",
    created_at: "2025-11-16",
  },
];

const AllShipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "assign" | "add" | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  const logisticsUsers = ["Logistic1", "Logistic2", "Logistic3"];

  useEffect(() => {
    setShipments(mockShipments);
  }, []);

  const openDrawer = (drawerMode: "view" | "assign" | "add", shipment?: Shipment) => {
    setMode(drawerMode);
    setSelectedShipment(shipment || null);
    if (drawerMode === "add") form.resetFields();
    if (shipment) form.setFieldsValue(shipment);
    setDrawerOpen(true);
  };

  const handleAssign = (logistic: string) => {
    if (!selectedShipment) return;
    setShipments((prev) =>
      prev.map((s) =>
        s.shipment_id === selectedShipment.shipment_id ? { ...s, assigned_logistic: logistic } : s
      )
    );
    setDrawerOpen(false);
  };

  const handleAddShipment = async () => {
    const values = await form.validateFields();
    const newShipment: Shipment = {
      shipment_id: `SHP${shipments.length + 1}`.padStart(6, "0"),
      tracking_number: `TRK${shipments.length + 1}`.padStart(6, "0"),
      created_at: new Date().toISOString().split("T")[0],
      ...values,
    };
    setShipments([...shipments, newShipment]);
    setDrawerOpen(false);
  };

  const filteredShipments = shipments.filter(
    (s) =>
      s.user_id.toLowerCase().includes(search.toLowerCase()) ||
      s.destination_country.toLowerCase().includes(search.toLowerCase()) ||
      s.destination_city.toLowerCase().includes(search.toLowerCase()) ||
      s.tracking_number.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: "User ID", dataIndex: "user_id" },
    { title: "Tracking #", dataIndex: "tracking_number" },
    {
      title: "Destination",
      render: (_: any, r: Shipment) => `${r.destination_city}, ${r.destination_country}`,
    },
    {
      title: "Method",
      dataIndex: "shipping_method",
      render: (m: string) => m.charAt(0).toUpperCase() + m.slice(1),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => {
        const color =
          s === "booked"
            ? "blue"
            : s === "in transit"
            ? "gold"
            : s === "at port"
            ? "orange"
            : s === "customs"
            ? "purple"
            : "green";
        return <Tag color={color}>{s.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Assigned Logistic",
      dataIndex: "assigned_logistic",
      render: (l: string) => l || <Tag>Not Assigned</Tag>,
    },
    {
      title: "Action",
      render: (_: any, record: Shipment) => (
        <Space>
          <Button onClick={() => openDrawer("view", record)} icon={<EyeOutlined />}>
            View
          </Button>
          <Button onClick={() => openDrawer("assign", record)} icon={<UserSwitchOutlined />}>
            Assign
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ color: "#0F3952", fontWeight: 700, marginBottom: 24 }}>Shipments Management</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Input
          placeholder="Search shipments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "50%" }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: "#0F3952", borderRadius: 6 }}
          onClick={() => openDrawer("add")}
        >
          Add Shipment
        </Button>
      </div>

      <Table
        dataSource={filteredShipments}
        columns={columns}
        rowKey="shipment_id"
        pagination={{ pageSize: 5 }}
      />

      <Drawer
        title={
          mode === "view"
            ? "Shipment Details"
            : mode === "assign"
            ? "Assign Logistic"
            : "Add New Shipment"
        }
        placement="right"
        width={450}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bodyStyle={{ backgroundColor: "white" }}
      >
        {mode === "view" && selectedShipment && (
          <Space direction="vertical" style={{ width: "100%", lineHeight: 1.8 }}>
            <p>
              <strong>Tracking #:</strong> {selectedShipment.tracking_number}
            </p>
            <p>
              <strong>User ID:</strong> {selectedShipment.user_id}
            </p>
            <p>
              <strong>Pickup:</strong> {selectedShipment.pickup_location}
            </p>
            <p>
              <strong>Destination:</strong> {selectedShipment.destination_city},{" "}
              {selectedShipment.destination_country}
            </p>
            <p>
              <strong>Goods:</strong> {selectedShipment.goods_description}
            </p>
            <p>
              <strong>Weight:</strong> {selectedShipment.weight} kg
            </p>
            <p>
              <strong>Volume:</strong> {selectedShipment.volume} m³
            </p>
            <p>
              <strong>Shipping Method:</strong> {selectedShipment.shipping_method}
            </p>
            <p>
              <strong>Status:</strong> {selectedShipment.status.toUpperCase()}
            </p>
            <p>
              <strong>Estimated Delivery:</strong>{" "}
              {selectedShipment.estimated_delivery_date || "N/A"}
            </p>
            <p>
              <strong>Assigned Logistic:</strong> {selectedShipment.assigned_logistic || "Not Assigned"}
            </p>
          </Space>
        )}

        {(mode === "assign" || mode === "add") && (
          <Form form={form} layout="vertical">
            <Form.Item name="user_id" label="User ID" rules={[{ required: true }]}>
              <Input disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="pickup_location" label="Pickup Location" rules={[{ required: true }]}>
              <Input disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="destination_country" label="Destination Country" rules={[{ required: true }]}>
              <Input disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="destination_city" label="Destination City" rules={[{ required: true }]}>
              <Input disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="goods_description" label="Goods Description" rules={[{ required: true }]}>
              <Input.TextArea rows={2} disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="weight" label="Weight (kg)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="volume" label="Volume (m³)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} disabled={mode === "assign"} />
            </Form.Item>
            <Form.Item name="shipping_method" label="Shipping Method" rules={[{ required: true }]}>
              <Select disabled={mode === "assign"}>
                <Option value="sea">Sea</Option>
                <Option value="air">Air</Option>
                <Option value="express">Express</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select disabled={mode === "assign"}>
                <Option value="booked">Booked</Option>
                <Option value="in transit">In Transit</Option>
                <Option value="at port">At Port</Option>
                <Option value="customs">Customs</Option>
                <Option value="delivered">Delivered</Option>
              </Select>
            </Form.Item>
            <Form.Item name="estimated_delivery_date" label="Estimated Delivery Date">
              <DatePicker style={{ width: "100%" }} disabled={mode === "assign"} />
            </Form.Item>
            {mode === "assign" && selectedShipment && (
              <Form.Item name="assigned_logistic" label="Assign Logistic">
                <Select
                  placeholder="Select Logistic User"
                  style={{ width: "100%" }}
                  onChange={handleAssign}
                >
                  {logisticsUsers.map((user) => (
                    <Option key={user} value={user}>
                      {user}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {mode === "add" && (
              <Button
                type="primary"
                onClick={handleAddShipment}
                style={{ width: "100%", background: "#0F3952", borderRadius: 6 }}
              >
                Add Shipment
              </Button>
            )}
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default AllShipments;
