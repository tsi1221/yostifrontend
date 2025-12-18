// src/pages/logistics/NewBooking.tsx
import  { useState } from "react";
import { Button, Modal, Form, Input, Select, DatePicker, Upload, message, Table, Tag, Space, Popconfirm } from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

interface Booking {
  id: string;
  customer: string;
  status: string;
  estDelivery: string;
  shipmentType?: string;
  docs?: any[];
}

const initialBookings: Booking[] = [
  { id: "SHP-001", customer: "ABC Trading", status: "Booked", estDelivery: "2025-12-05" },
  { id: "SHP-002", customer: "Global Express", status: "In Transit", estDelivery: "2025-12-07" },
];

export default function NewBooking() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Open modal for Add/Edit
  const openModal = (booking?: Booking) => {
    if (booking) {
      setEditingBooking(booking);
      form.setFieldsValue({
        ...booking,
        estimatedDelivery: dayjs(booking.estDelivery),
      });
    } else {
      setEditingBooking(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleBookingSubmit = (values: any) => {
    if (editingBooking) {
      // Edit existing
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingBooking.id
            ? { ...b, customer: values.customer, estDelivery: dayjs(values.estimatedDelivery).format("YYYY-MM-DD"), shipmentType: values.shipmentType, docs: values.docs }
            : b
        )
      );
      message.success("Booking updated successfully!");
    } else {
      // Add new
      const newBooking: Booking = {
        id: `SHP-${(bookings.length + 1).toString().padStart(3, "0")}`,
        customer: values.customer,
        status: "Booked",
        estDelivery: dayjs(values.estimatedDelivery).format("YYYY-MM-DD"),
        shipmentType: values.shipmentType,
        docs: values.docs,
      };
      setBookings([newBooking, ...bookings]);
      message.success("New shipment booking created!");
    }
    form.resetFields();
    setModalVisible(false);
    setEditingBooking(null);
  };

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    message.success("Booking deleted!");
  };

  const columns = [
    { title: "Shipment ID", dataIndex: "id", key: "id" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Delivered"
            ? "green"
            : status === "In Transit"
            ? "blue"
            : status === "Pending Docs"
            ? "orange"
            : "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Estimated Delivery", dataIndex: "estDelivery", key: "estDelivery" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Booking) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => openModal(record)}>
            View
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm title="Are you sure to delete?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>Shipment Bookings</h1>
        <Button type="primary" onClick={() => openModal()} style={{ backgroundColor: "#0F3952", borderColor: "#0F3952" }}>
          Add New Booking
        </Button>
      </div>

      <Table
        dataSource={bookings}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
        style={{ backgroundColor: "#fff", borderRadius: 8, overflow: "hidden" }}
      />

      <Modal
        title={editingBooking ? "Edit Booking" : "Add New Shipment Booking"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleBookingSubmit}>
          <Form.Item
            name="customer"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input placeholder="Customer Name" />
          </Form.Item>

          <Form.Item
            name="estimatedDelivery"
            label="Estimated Delivery"
            rules={[{ required: true, message: "Select estimated delivery date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="shipmentType"
            label="Shipment Type"
            rules={[{ required: true, message: "Select shipment type" }]}
          >
            <Select placeholder="Select type">
              <Option value="Sea">Sea</Option>
              <Option value="Air">Air</Option>
              <Option value="Express">Express</Option>
            </Select>
          </Form.Item>

          <Form.Item name="docs" label="Upload Documents">
            <Upload beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />}>Upload bill/invoice/customs docs</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ marginTop: 8, backgroundColor: "#0F3952" }}>
            {editingBooking ? "Update Booking" : "Submit Booking"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
