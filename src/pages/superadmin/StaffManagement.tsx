// src/pages/superadmin/StaffManagement.tsx
import { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserSwitchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

// Define Staff type
interface Staff {
  id: string;
  name: string;
  email: string;
  role: "admin" | "finance" | "logistics";
  phone: string;
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([
    { id: "ADM001", name: "Yonatan Alemu", email: "yonatan@example.com", role: "admin", phone: "+251911223344" },
    { id: "ADM002", name: "Lidya Mebratu", email: "lidya@example.com", role: "finance", phone: "+251922334455" },
  ]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);

  const [addForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  const openAddModal = () => {
    addForm.resetFields();
    setSelected(null);
    setOpenAdd(true);
  };

  const editStaff = (record: Staff) => {
    setSelected(record);
    addForm.setFieldsValue(record);
    setOpenAdd(true);
  };

  const saveStaff = () => {
    addForm
      .validateFields()
      .then((values: Omit<Staff, "id">) => {
        if (selected) {
          setStaff((prev) =>
            prev.map((s) => (s.id === selected.id ? { ...s, ...values } : s))
          );
          message.success("Staff updated successfully");
        } else {
          const newStaff: Staff = {
            id: "ADM" + String(staff.length + 1).padStart(3, "0"),
            ...values,
          };
          setStaff((prev) => [...prev, newStaff]);
          message.success("New staff added");
        }
        setOpenAdd(false);
        addForm.resetFields();
        setSelected(null);
      })
      .catch(() => {});
  };

  const deleteStaff = (record: Staff) => {
    Modal.confirm({
      title: "Delete Staff?",
      content: `Are you sure you want to delete ${record.name}?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        setStaff((prev) => prev.filter((s) => s.id !== record.id));
        message.success("Staff deleted");
      },
    });
  };

  const assignRole = (record: Staff) => {
    setSelected(record);
    assignForm.setFieldsValue({ role: record.role });
    setOpenAssign(true);
  };

  const saveAssign = () => {
    if (!selected) return;
    assignForm
      .validateFields()
      .then((values: Pick<Staff, "role">) => {
        setStaff((prev) =>
          prev.map((s) => (s.id === selected.id ? { ...s, role: values.role } : s))
        );
        message.success("Role updated successfully");
        setOpenAssign(false);
        assignForm.resetFields();
        setSelected(null);
      })
      .catch(() => {});
  };

  const columns: ColumnsType<Staff> = [
    { title: "ID", dataIndex: "id" },
    { title: "Full Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: Staff["role"]) => <Tag color="blue">{role.toUpperCase()}</Tag>,
    },
    {
      title: "Actions",
      render: (_: any, record: Staff) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => editStaff(record)} />
          <Button icon={<UserSwitchOutlined />} onClick={() => assignRole(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => deleteStaff(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F3952" }}>Manage Yosti Admins</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          style={{ background: "#0F3952" }}
        >
          Add Staff
        </Button>
      </div>

      <Table
        bordered
        rowKey="id"
        columns={columns}
        dataSource={staff}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={selected ? "Edit Staff" : "Add Staff"}
        open={openAdd}
        onCancel={() => {
          setOpenAdd(false);
          setSelected(null);
        }}
        onOk={saveStaff}
        okText="Save"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        title={`Assign Role - ${selected?.name || ""}`}
        open={openAssign}
        onCancel={() => {
          setOpenAssign(false);
          setSelected(null);
        }}
        onOk={saveAssign}
        okText="Save Role"
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item name="role" label="Select Role" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="finance">Finance</Option>
              <Option value="logistics">Logistics</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
