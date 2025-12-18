// src/pages/buyer/MyInspections.tsx
import  { useState } from "react";
import { Table, Button, Drawer, Form, Input, Select, DatePicker, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

interface Inspection {
  inspection_id: string;
  user_id: string;
  supplier_id: string;
  product_type: string;
  inspection_type: "sample" | "pre-shipment" | "factory visit";
  date: string;
  photo_video_required: boolean;
  report_url?: string;
  created_at: string;
}

const initialInspections: Inspection[] = [
  {
    inspection_id: "INS-001",
    user_id: "USR-001",
    supplier_id: "SUP-001",
    product_type: "Bluetooth Speaker",
    inspection_type: "pre-shipment",
    date: "2025-11-20",
    photo_video_required: true,
    report_url: "",
    created_at: "2025-11-10",
  },
  {
    inspection_id: "INS-002",
    user_id: "USR-001",
    supplier_id: "SUP-002",
    product_type: "Packaging Bags",
    inspection_type: "sample",
    date: "2025-11-22",
    photo_video_required: false,
    report_url: "",
    created_at: "2025-11-12",
  },
];

export default function MyInspectionsBuyer() {
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "Inspection ID",
      dataIndex: "inspection_id",
      key: "inspection_id",
      render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    { title: "Supplier ID", dataIndex: "supplier_id", key: "supplier_id" },
    { title: "Product Type", dataIndex: "product_type", key: "product_type" },
    { title: "Inspection Type", dataIndex: "inspection_type", key: "inspection_type" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Photo/Video Required",
      dataIndex: "photo_video_required",
      key: "photo_video_required",
      render: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Report",
      dataIndex: "report_url",
      key: "report_url",
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600">
            View
          </a>
        ) : (
          "-"
        ),
    },
  ];

  const handleRequestInspection = (values: any) => {
    const newInspection: Inspection = {
      inspection_id: `INS-${Math.floor(Math.random() * 999).toString().padStart(3, "0")}`,
      user_id: "USR-001",
      supplier_id: values.supplier_id,
      product_type: values.product_type,
      inspection_type: values.inspection_type,
      date: values.date.format("YYYY-MM-DD"),
      photo_video_required: values.photo_video_required,
      report_url: "",
      created_at: dayjs().format("YYYY-MM-DD"),
    };
    setInspections([newInspection, ...inspections]);
    form.resetFields();
    setOpenDrawer(false);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Inspections</h1>
        <Button
          icon={<PlusOutlined />}
          style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
          onClick={() => setOpenDrawer(true)}
        >
          Request Inspection
        </Button>
      </div>

      {/* INSPECTIONS TABLE */}
      <Table
        dataSource={inspections}
        columns={columns}
        rowKey="inspection_id"
        pagination={{ position: ["bottomRight"], pageSize: 5 }}
      />

      {/* REQUEST INSPECTION DRAWER */}
      <Drawer
        title="Request Quality Inspection"
        open={openDrawer}
        width={400}
        onClose={() => setOpenDrawer(false)}
      >
        <Form layout="vertical" form={form} onFinish={handleRequestInspection}>
          <Form.Item label="Supplier ID" name="supplier_id" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Product Type" name="product_type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Inspection Type" name="inspection_type" rules={[{ required: true }]}>
            <Select>
              <Option value="sample">Sample</Option>
              <Option value="pre-shipment">Pre-Shipment</Option>
              <Option value="factory visit">Factory Visit</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Date" name="date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item label="Photo/Video Required" name="photo_video_required" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button
            htmlType="submit"
            className="w-full"
            style={{ backgroundColor: "#0f3952", color: "white", border: "none" }}
          >
            Submit Request
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
