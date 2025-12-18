import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Space,
  Row,
  Col,
} from "antd";
import { SaveOutlined, CloseOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

interface SourcingRequest {
  request_id: string;
  user_id: string;
  product_name: string;
  description: string;
  quantity: number;
  target_price: number;
  supplier_region: string;
  sample_required: boolean;
  deadline: string;
  status: "open" | "quoted" | "completed";
}

const SourcingDashboard: React.FC = () => {
  const [requests, setRequests] = useState<SourcingRequest[]>([
    {
      request_id: "REQ001",
      user_id: "USR01",
      product_name: "Wireless Mouse",
      description: "Ergonomic mouse with Bluetooth",
      quantity: 50,
      target_price: 12,
      supplier_region: "Shenzhen",
      sample_required: true,
      deadline: "2025-11-30",
      status: "open",
    },
    {
      request_id: "REQ002",
      user_id: "USR05",
      product_name: "USB-C Cable",
      description: "1.5m fast charging cables",
      quantity: 200,
      target_price: 2.5,
      supplier_region: "Guangzhou",
      sample_required: false,
      deadline: "2025-12-05",
      status: "quoted",
    },
  ]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingRequest, setEditingRequest] = useState<SourcingRequest | null>(null);
  const [form] = Form.useForm();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);

  const openDrawer = (request?: SourcingRequest, view = false) => {
    setEditingRequest(request || null);
    setViewMode(view);

    form.resetFields();
    if (request) form.setFieldsValue(request);

    setDrawerVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();

    if (editingRequest) {
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === editingRequest.request_id ? { ...r, ...values } : r
        )
      );
    } else {
      const newRequest: SourcingRequest = {
        request_id: "REQ" + (requests.length + 1),
        status: "open",
        ...values,
      };
      setRequests([...requests, newRequest]);
    }

    setDrawerVisible(false);
  };

  const filteredData = requests.filter((item) => {
    const matchSearch =
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      item.user_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    const matchRegion = filterRegion ? item.supplier_region === filterRegion : true;

    return matchSearch && matchStatus && matchRegion;
  });

  const columns = [
    { title: "Product", dataIndex: "product_name" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "User", dataIndex: "user_id" },
    { title: "Region", dataIndex: "supplier_region" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color={status === "open" ? "blue" : status === "quoted" ? "gold" : "green"}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_: unknown, record: SourcingRequest) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => openDrawer(record, true)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "32px 40px" }}>
      <h2 style={{ color: "#0F3952", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
        Sourcing Requests
      </h2>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Input
            placeholder="Search by product or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col span={5}>
          <Select
            allowClear
            placeholder="Filter by Status"
            style={{ width: "100%" }}
            onChange={(v) => setFilterStatus(v)}
          >
            <Option value="open">Open</Option>
            <Option value="quoted">Quoted</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Col>
        <Col span={5}>
          <Select
            allowClear
            placeholder="Filter by Region"
            style={{ width: "100%" }}
            onChange={(v) => setFilterRegion(v)}
          >
            <Option value="Yiwu">Yiwu</Option>
            <Option value="Guangzhou">Guangzhou</Option>
            <Option value="Shenzhen">Shenzhen</Option>
          </Select>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#0F3952", borderRadius: 6, fontWeight: 600 }}
            onClick={() => openDrawer()}
          >
            Add Request
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="request_id"
        bordered
        pagination={{ pageSize: 10, position: ["bottomRight"] }}
      />

      <Drawer
        title={viewMode ? "Request Details" : editingRequest ? "Edit Request" : "Add Request"}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={420}
        footer={
          !viewMode && (
            <Space style={{ justifyContent: "flex-end", width: "100%" }}>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setDrawerVisible(false)}
                style={{
                  border: "1px solid #0F3952",
                  color: "#0F3952",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                style={{ background: "#0F3952", border: "none", borderRadius: 6, fontWeight: 600 }}
                onClick={handleSave}
              >
                Add
              </Button>
            </Space>
          )
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="user_id" label="User ID" rules={[{ required: true }]}>
            <Input disabled={viewMode} />
          </Form.Item>

          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
            <Input disabled={viewMode} />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} disabled={viewMode} />
          </Form.Item>

          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <Input type="number" min={1} disabled={viewMode} />
          </Form.Item>

          <Form.Item name="target_price" label="Target Price" rules={[{ required: true }]}>
            <Input type="number" min={0} step={0.01} disabled={viewMode} />
          </Form.Item>

          <Form.Item name="supplier_region" label="Supplier Region">
            <Select disabled={viewMode}>
              <Option value="Yiwu">Yiwu</Option>
              <Option value="Guangzhou">Guangzhou</Option>
              <Option value="Shenzhen">Shenzhen</Option>
            </Select>
          </Form.Item>

          <Form.Item name="sample_required" valuePropName="checked" label="Sample Required?">
            <Checkbox disabled={viewMode}>Yes</Checkbox>
          </Form.Item>

          <Form.Item name="deadline" label="Deadline">
            <DatePicker style={{ width: "100%" }} disabled={viewMode} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default SourcingDashboard;
