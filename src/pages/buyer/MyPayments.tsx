// src/pages/buyer/MyPayments.tsx
import  { useState } from "react";
import { Table, Button, Drawer, Form, Input, InputNumber, Select, Tag } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface Payment {
  payment_id: string;
  user_id: string;
  service_type: "sourcing" | "logistics" | "inspection" | "trip" | "visa";
  amount: number;
  currency: string;
  payment_method: "bank transfer" | "card" | "Alipay" | "WeChat Pay";
  status: "pending" | "completed" | "failed";
  created_at: string;
}

const initialPayments: Payment[] = [
  {
    payment_id: "PAY-001",
    user_id: "USR-001",
    service_type: "logistics",
    amount: 500,
    currency: "USD",
    payment_method: "card",
    status: "pending",
    created_at: "2025-11-15 10:30",
  },
  {
    payment_id: "PAY-002",
    user_id: "USR-001",
    service_type: "sourcing",
    amount: 250,
    currency: "USD",
    payment_method: "Alipay",
    status: "completed",
    created_at: "2025-11-12 14:00",
  },
];

export default function MyPayments() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [form] = Form.useForm();

  // Type-safe columns
  const columns = [
    {
      title: "Payment ID",
      dataIndex: "payment_id",
      key: "payment_id",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Service",
      dataIndex: "service_type",
      key: "service_type",
      render: (text: Payment["service_type"]) => text.toUpperCase(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (_: any, record: Payment) => `${record.currency} ${record.amount.toFixed(2)}`,
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (text: Payment["payment_method"]) => text,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Payment["status"]) => {
        let color = "default";
        if (status === "completed") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "failed") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Payment) => (
        <Button
          style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
          onClick={() => {
            setSelectedPayment(record);
            setOpenDrawer(true);
            form.setFieldsValue({ payment_method: record.payment_method });
          }}
        >
          Make Payment
        </Button>
      ),
    },
  ];

  // Type-safe payment handler
  const handleMakePayment = (values: { payment_method: Payment["payment_method"] }) => {
    if (!selectedPayment) return;

    const updatedPayments: Payment[] = payments.map((p) =>
      p.payment_id === selectedPayment.payment_id
        ? { ...p, payment_method: values.payment_method, status: "completed" }
        : p
    );

    setPayments(updatedPayments);
    setOpenDrawer(false);
    form.resetFields();
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Payments</h1>

      <Table
        dataSource={payments}
        columns={columns}
        rowKey="payment_id"
        pagination={{ position: ["bottomRight"], pageSize: 5 }}
      />

      <Drawer
        title={`Make Payment ${selectedPayment?.payment_id || ""}`}
        open={openDrawer}
        width={400}
        onClose={() => setOpenDrawer(false)}
      >
        {selectedPayment && selectedPayment.status !== "completed" ? (
          <Form layout="vertical" form={form} onFinish={handleMakePayment}>
            <Form.Item label="Service Type">
              <Input value={selectedPayment.service_type.toUpperCase()} disabled />
            </Form.Item>

            <Form.Item label="Amount">
              <InputNumber
                value={selectedPayment.amount}
                disabled
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Payment Method"
              name="payment_method"
              rules={[{ required: true, message: "Select a payment method" }]}
            >
              <Select placeholder="Select Method">
                <Option value="bank transfer">Bank Transfer</Option>
                <Option value="card">Card</Option>
                <Option value="Alipay">Alipay</Option>
                <Option value="WeChat Pay">WeChat Pay</Option>
              </Select>
            </Form.Item>

            <Button
              htmlType="submit"
              className="w-full"
              style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
            >
              Pay Now
            </Button>
          </Form>
        ) : (
          <p className="text-green-700 font-semibold">
            Payment completed for this service.
          </p>
        )}
      </Drawer>
    </div>
  );
}
