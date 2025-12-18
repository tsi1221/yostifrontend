// src/pages/buyer/MyShipments.tsx
import { useState } from "react";
import { Drawer, Button, Form, Input, InputNumber, Select, Table } from "antd";
import { EnvironmentOutlined, PlusOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";

const { Option } = Select;

interface ShipmentUpdate {
  update_id: string;
  shipment_id: string;
  location: string;
  status: "booked" | "in transit" | "at port" | "customs" | "delivered";
  remarks: string;
  update_time: string;
}

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
  status: ShipmentUpdate["status"];
  estimated_delivery: string;
  updates: ShipmentUpdate[];
}

const initialShipments: Shipment[] = [
  {
    shipment_id: "SHP-001",
    user_id: "USR-001",
    pickup_location: "Guangzhou Warehouse",
    destination_country: "Ethiopia",
    destination_city: "Addis Ababa",
    goods_description: "Bluetooth Speakers",
    weight: 120,
    volume: 3.5,
    shipping_method: "air",
    tracking_number: "TRK-99231A",
    status: "in transit",
    estimated_delivery: "2025-12-01",
    updates: [
      {
        update_id: "UPD-001",
        shipment_id: "SHP-001",
        location: "Guangzhou Warehouse",
        status: "booked",
        remarks: "Shipment booked",
        update_time: "2025-11-01 10:00",
      },
      {
        update_id: "UPD-002",
        shipment_id: "SHP-001",
        location: "Guangzhou Airport",
        status: "in transit",
        remarks: "Shipment departed",
        update_time: "2025-11-03 14:30",
      },
    ],
  },
];

export default function MyShipments() {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [openBook, setOpenBook] = useState(false);
  const [openTrack, setOpenTrack] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [form] = Form.useForm();

  const timelineSteps: ShipmentUpdate["status"][] = [
    "booked",
    "in transit",
    "at port",
    "customs",
    "delivered",
  ];

  // Helper to get update info safely
  const getUpdate = (shipment: Shipment, step: ShipmentUpdate["status"]) =>
    shipment.updates.find((u) => u.status === step);

  const columns = [
    {
      title: "Tracking No.",
      dataIndex: "tracking_number",
      key: "tracking_number",
      render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: "Destination",
      key: "destination",
      render: (_: any, record: Shipment) =>
        `${record.destination_city}, ${record.destination_country}`,
    },
    { title: "Method", dataIndex: "shipping_method", key: "shipping_method" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Est. Delivery",
      dataIndex: "estimated_delivery",
      key: "estimated_delivery",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Shipment) => (
        <Button
          icon={<EnvironmentOutlined />}
          style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
          size="small"
          onClick={() => {
            setSelectedShipment(record);
            setOpenTrack(true);
          }}
        >
          Track
        </Button>
      ),
    },
  ];

  const handleBook = (values: any) => {
    const shipmentId = `SHP-${Math.floor(Math.random() * 999).toString().padStart(3, "0")}`;
    const updateId = `UPD-${Math.floor(Math.random() * 999).toString().padStart(3, "0")}`;
    const newShipment: Shipment = {
      shipment_id: shipmentId,
      user_id: "USR-001",
      pickup_location: values.pickup_location,
      destination_country: values.destination_country,
      destination_city: values.destination_city,
      goods_description: values.goods_description,
      weight: values.weight,
      volume: values.volume,
      shipping_method: values.shipping_method,
      tracking_number: "TRK-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: "booked",
      estimated_delivery: dayjs().add(15, "day").format("YYYY-MM-DD"),
      updates: [
        {
          update_id: updateId,
          shipment_id: shipmentId,
          location: values.pickup_location,
          status: "booked",
          remarks: "Shipment booked",
          update_time: dayjs().format("YYYY-MM-DD HH:mm"),
        },
      ],
    };
    setShipments([newShipment, ...shipments]);
    form.resetFields();
    setOpenBook(false);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Shipments</h1>
        <Button
          icon={<PlusOutlined />}
          style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
          onClick={() => setOpenBook(true)}
        >
          Book Shipment
        </Button>
      </div>

      <Table
        dataSource={shipments}
        columns={columns}
        rowKey="shipment_id"
        pagination={{ position: ["bottomRight"], pageSize: 5 }}
      />

      {/* BOOKING DRAWER */}
      <Drawer
        title="Book New Shipment"
        open={openBook}
        width={400}
        onClose={() => setOpenBook(false)}
      >
        <Form layout="vertical" form={form} onFinish={handleBook}>
          <Form.Item label="Pickup Location" name="pickup_location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Destination Country" name="destination_country" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Destination City" name="destination_city" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Goods Description" name="goods_description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Weight (kg)" name="weight" rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item label="Volume (m³)" name="volume" rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item label="Shipping Method" name="shipping_method" rules={[{ required: true }]}>
            <Select>
              <Option value="sea">Sea</Option>
              <Option value="air">Air</Option>
              <Option value="express">Express</Option>
            </Select>
          </Form.Item>
          <Button
            htmlType="submit"
            className="w-full"
            style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
          >
            Confirm Booking
          </Button>
        </Form>
      </Drawer>

      {/* TRACKING DRAWER */}
      <Drawer
        title="Live Shipment Tracking"
        open={openTrack}
        width={450}
        onClose={() => setOpenTrack(false)}
      >
        {selectedShipment && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Status Timeline</h3>
              <ul className="space-y-2">
                {timelineSteps.map((step) => {
                  const update = getUpdate(selectedShipment, step);
                  return (
                    <li key={step} className="p-2 rounded border border-gray-300">
                      <div className="flex justify-between">
                        <span className="font-medium">{step.toUpperCase()}</span>
                        <span className="text-sm">
                          {update ? dayjs(update.update_time).format("YYYY-MM-DD HH:mm") : "-"}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        {update?.location}
                        {update?.remarks ? " — " + update.remarks : ""}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <h3 className="font-semibold text-gray-900">Live Map</h3>
            <div className="h-64 rounded overflow-hidden">
              <MapContainer center={[30.6, 104.0]} zoom={5} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[30.6, 104.0]}>
                  <Popup>Shipment is in transit</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
