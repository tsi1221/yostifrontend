import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Select,
  Input,
  Space,
  Popconfirm,
  Avatar,
} from "antd";
import {
  EyeOutlined,
 
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import {
  type Inspection,
  type InspectionStatus,
  useInspectionsAdmin,
} from "../../VisitorPublicUser/hooks/useInspectionsAdmin";

/* ================= COMPONENT ================= */

const Inspections = () => {
  const {
    inspections,
    pagination,
    loading,
    fetchInspections,
    updateInspection,
    deleteInspection,
  } = useInspectionsAdmin();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Inspection | null>(null);
  const [form] = Form.useForm();

  /* ===== TABLE COLUMNS ===== */

  const columns: ColumnsType<Inspection> = [
    {
      title: "Buyer",
      dataIndex: "user",
      render: (user) => (
        <Space>
          <Avatar src={user.profileImage} />
          {user.fullName}
        </Space>
      ),
    },
    {
      title: "Product",
      dataIndex: "productType",
    },
    {
      title: "Type",
      dataIndex: "inspectionType",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "inspectionDate",
      render: (v) => dayjs(v).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: InspectionStatus) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelected(record);
              form.setFieldsValue(record);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Delete inspection?"
            onConfirm={() => deleteInspection(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ===== UPDATE SUBMIT ===== */

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await updateInspection(selected!._id, values);
    setOpen(false);
  };

  return (
    <>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={inspections}
        loading={loading}
        pagination={{
          total: pagination?.total,
          pageSize: pagination?.pageSize,
          current: pagination?.currentPage,
          onChange: (page, pageSize) =>
            fetchInspections(page, pageSize),
        }}
      />

      <Drawer
        title="Update Inspection"
        open={open}
        onClose={() => setOpen(false)}
        width={420}
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default Inspections;
