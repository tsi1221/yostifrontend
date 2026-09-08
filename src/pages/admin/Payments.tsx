import { useState, useEffect } from "react";
import { Table, Tag, Button, Drawer, Form, Select, Input, Space, message, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Payment {
  payment_id: string;
  user_id: string;
  service_type: "sourcing" | "logistics" | "inspection" | "trip" | "visa";
  amount: number;
  currency: string;
  payment_method: "bank transfer" | "card" | "Alipay" | "WeChat Pay";
  status: "pending" | "completed" | "failed";
  after_sales?: "refund" | "replacement" | "repair";
  remarks?: string;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"view" | "edit" | "respond">("view");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const mockData: Payment[] = [
      { payment_id: "1", user_id: "User001", service_type: "sourcing", amount: 120, currency: "USD", payment_method: "card", status: "completed" },
      { payment_id: "2", user_id: "User002", service_type: "logistics", amount: 75, currency: "USD", payment_method: "bank transfer", status: "pending" },
      { payment_id: "3", user_id: "User003", service_type: "inspection", amount: 50, currency: "USD", payment_method: "Alipay", status: "completed" },
      { payment_id: "4", user_id: "User004", service_type: "trip", amount: 200, currency: "USD", payment_method: "WeChat Pay", status: "pending" },
      { payment_id: "5", user_id: "User005", service_type: "visa", amount: 180, currency: "USD", payment_method: "card", status: "completed" },
    ];
    setPayments(mockData);
  }, []);

  const openDrawer = (payment: Payment, type: "view" | "edit" | "respond") => {
    setSelectedPayment(payment);
    setDrawerType(type);
    if (type !== "view") form.setFieldsValue(payment);
    setDrawerOpen(true);
  };

  const handleDelete = (payment_id: string) => {
    setPayments(prev => prev.filter(p => p.payment_id !== payment_id));
    message.success("Payment deleted successfully");
  };

  const handleSave = async () => {
    if (!selectedPayment) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const updatedPayment = { ...selectedPayment, ...values };
      setPayments(prev => prev.map(p => (p.payment_id === selectedPayment.payment_id ? updatedPayment : p)));
      message.success("Payment updated successfully");
      setDrawerOpen(false);
      setSelectedPayment(null);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Failed to update payment");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    // { title: "User ID", dataIndex: "user_id", key: "user_id", render: text => <b>{text}</b> },
    { title: "Service", dataIndex: "service_type", key: "service_type" },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (amount: number, record: Payment) => `${amount} ${record.currency}` },
    { title: "Payment Method", dataIndex: "payment_method", key: "payment_method" },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === "completed" ? "green" : status === "pending" ? "orange" : "red"}>{status.toUpperCase()}</Tag> },
    // { title: "After Sales", dataIndex: "after_sales", key: "after_sales", render: text => text ? text.charAt(0).toUpperCase() + text.slice(1) : "N/A" },
    {
      title: "Actions",
      key: "actions",
      render: (_:    unknown             , record: Payment) => (
        <Space>
          <Button type="default" style={{ borderColor: "#0F3952", color: "#0F3952" }} icon={<EyeOutlined />} onClick={() => openDrawer(record, "view")}>View</Button>
          <Button type="default" style={{ borderColor: "#0F3952", color: "#0F3952" }} icon={<EditOutlined />} onClick={() => openDrawer(record, "edit")}>Edit</Button>
          <Button type="default" style={{ borderColor: "#FFD700", color: "#0F3952" }} icon={<CheckOutlined />} onClick={() => openDrawer(record, "respond")}>Respond</Button>
          <Popconfirm title="Delete this payment?" onConfirm={() => handleDelete(record.payment_id)} okText="Yes" cancelText="No">
            <Button type="default" style={{ borderColor: "red", color: "red" }} icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#0F3952", marginBottom: 16, fontSize: 28, fontWeight: 600 }}>
        Manage Payments
      </h2>

      <Table dataSource={payments} columns={columns} rowKey="payment_id" pagination={{ pageSize: 10 }} />

      <Drawer
        title={selectedPayment ? `${drawerType.charAt(0).toUpperCase() + drawerType.slice(1)} Payment - ${selectedPayment.user_id}` : "Payment"}
        width={400}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedPayment && drawerType === "view" && (
          <div>
            <p><b>User ID:</b> {selectedPayment.user_id}</p>
            <p><b>Service:</b> {selectedPayment.service_type}</p>
            <p><b>Amount:</b> {selectedPayment.amount} {selectedPayment.currency}</p>
            <p><b>Payment Method:</b> {selectedPayment.payment_method}</p>
            <p><b>Status:</b> {selectedPayment.status.toUpperCase()}</p>
            <p><b>After Sales:</b> {selectedPayment.after_sales || "N/A"}</p>
            <p><b>Remarks:</b> {selectedPayment.remarks || "N/A"}</p>
          </div>
        )}

        {(drawerType === "edit" || drawerType === "respond") && (
          <Form form={form} layout="vertical">
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="failed">Failed</Option>
              </Select>
            </Form.Item>

            <Form.Item name="after_sales" label="After Sales">
              <Select placeholder="Select after-sales action" allowClear>
                <Option value="refund">Refund</Option>
                <Option value="replacement">Replacement</Option>
                <Option value="repair">Repair</Option>
              </Select>
            </Form.Item>

            <Form.Item name="remarks" label="Remarks">
              <Input.TextArea rows={3} placeholder="Add remarks" />
            </Form.Item>

            <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Button icon={<CloseOutlined />} onClick={() => setDrawerOpen(false)} style={{ border: "1px solid #0F3952", color: "#0F3952", borderRadius: 6 }}>
                Cancel
              </Button>
              <Button icon={<SaveOutlined />} type="primary" onClick={handleSave} loading={loading} style={{ background: "#0F3952", border: "none", borderRadius: 6 }}>
                Save
              </Button>
            </Space>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default Payments;
