import  { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Drawer,
  Form,
  Input,
  Select,
  message,
  Tag,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface UserType {
  id: number;
  fullName: string;
  company?: string;
  country: string;
  phone: string;
  email: string;
  role: string;
}

export default function AllUsers() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [assignForm] = Form.useForm();

  const [addUserDrawer, setAddUserDrawer] = useState(false);
  const [editDrawer, setEditDrawer] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [users, setUsers] = useState<UserType[]>([
    {
      id: 1,
      fullName: "John Doe",
      company: "ABC Corp",
      country: "Ethiopia",
      phone: "+251912345678",
      email: "john@example.com",
      role: "Supplier",
    },
  ]);

  // ---------------------------
  // ADD USER
  // ---------------------------

  const openAddDrawer = () => {
    form.resetFields();
    setAddUserDrawer(true);
  };

  const handleAddUser = () => {
    form.validateFields().then((values) => {
      const newUser = {
        id: Date.now(),
        fullName: values.fullName,
        company: values.company || "",
        country: values.country,
        phone: values.phone,
        email: values.email,
        role: values.role,
      };

      setUsers([...users, newUser]);
      message.success("User added successfully!");
      setAddUserDrawer(false);
    });
  };

  // ---------------------------
  // EDIT USER
  // ---------------------------

  const openEditDrawer = (record: UserType) => {
    setSelectedUser(record);
    editForm.setFieldsValue(record);
    setEditDrawer(true);
  };

  const handleEditUser = () => {
    editForm.validateFields().then((values) => {
      const updated = users.map((u) =>
        u.id === selectedUser?.id ? { ...u, ...values } : u
      );
      setUsers(updated);
      message.success("User updated!");
      setEditDrawer(false);
    });
  };

  // ---------------------------
  // ASSIGN ROLE MODAL
  // ---------------------------

  const openAssignModal = (record: UserType) => {
    setSelectedUser(record);
    assignForm.setFieldsValue({ role: record.role });
    setAssignModal(true);
  };

  const handleAssignRole = () => {
    assignForm.validateFields().then((values) => {
      const updated = users.map((u) =>
        u.id === selectedUser?.id ? { ...u, role: values.role } : u
      );
      setUsers(updated);
      message.success("Role assigned successfully!");
      setAssignModal(false);
    });
  };

  // ---------------------------
  // DELETE USER
  // ---------------------------

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
    message.success("User deleted!");
  };

  // ---------------------------
  // VIEW USER
  // ---------------------------

  const handleView = (record: UserType) => {
    setSelectedUser(record);
    setViewModal(true);
  };

  // ---------------------------
  // TABLE COLUMNS
  // ---------------------------

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Country",
      dataIndex: "country",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Actions",
      render: (_: any, record: UserType) => (
        <Space>
          <Button icon={<EyeOutlined />} type="link" onClick={() => handleView(record)}>
            View
          </Button>

          {/* ASSIGN ROLE */}
          <Button
            icon={<SwapOutlined />}
            style={{
              background: "#0F3952",
              color: "#fff",
              borderRadius: 6,
            }}
            onClick={() => openAssignModal(record)}
          />

          {/* EDIT */}
          <Button
            icon={<EditOutlined />}
            style={{ borderRadius: 6 }}
            onClick={() => openEditDrawer(record)}
          />

          {/* DELETE */}
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // =============================================================
  // COMPONENT UI
  // =============================================================

  return (
    <div style={{ padding: 20 }}>
      {/* TOP ACTION BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button
          icon={<PlusOutlined />}
          style={{
            background: "#0F3952",
            color: "#fff",
            borderRadius: 6,
          }}
          onClick={openAddDrawer}
        >
          Add User
        </Button>
      </div>

      {/* USERS TABLE */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "100%" }}
      />

      {/* ============================
          VIEW USER MODAL
      ============================ */}
      <Modal
        open={viewModal}
        title="User Detail"
        onCancel={() => setViewModal(false)}
        footer={null}
        centered
      >
        {selectedUser && (
          <div>
            <p><b>Name:</b> {selectedUser.fullName}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Phone:</b> {selectedUser.phone}</p>
            <p><b>Country:</b> {selectedUser.country}</p>
            <p><b>Company:</b> {selectedUser.company || "—"}</p>
            <p><b>Role:</b> {selectedUser.role}</p>
          </div>
        )}
      </Modal>

      {/* ============================
          ASSIGN ROLE MODAL
      ============================ */}
      <Modal
        open={assignModal}
        title="Assign Role"
        onCancel={() => setAssignModal(false)}
        onOk={handleAssignRole}
        okText="Save"
        centered
      >
        <Form layout="vertical" form={assignForm}>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a role">
              <Option value="Individual">Individual</Option>
              <Option value="Buyer">Buyer</Option>
              <Option value="Supplier">Supplier</Option>
              <Option value="Logistics">Logistics</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ============================
          ADD USER DRAWER
      ============================ */}
      <Drawer
        title="Add New User"
        placement="right"
        width={window.innerWidth < 600 ? "100%" : 420}
        open={addUserDrawer}
        onClose={() => setAddUserDrawer(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Company Name" name="company">
            <Input />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Ethiopia">Ethiopia</Option>
              <Option value="Kenya">Kenya</Option>
              <Option value="USA">USA</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Account Type"
            name="role"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Individual">Individual</Option>
              <Option value="Buyer">Buyer</Option>
              <Option value="Supplier">Supplier</Option>
              <Option value="Logistics">Logistics</Option>
            </Select>
          </Form.Item>

          <Button
            block
            style={{
              background: "#0F3952",
              color: "#fff",
              height: 40,
              borderRadius: 6,
            }}
            onClick={handleAddUser}
          >
            Save
          </Button>
        </Form>
      </Drawer>

      {/* ============================
          EDIT USER DRAWER
      ============================ */}
      <Drawer
        title="Edit User"
        placement="right"
        width={window.innerWidth < 600 ? "100%" : 420}
        open={editDrawer}
        onClose={() => setEditDrawer(false)}
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="company" label="Company Name">
            <Input />
          </Form.Item>

          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Select>
              <Option value="Ethiopia">Ethiopia</Option>
              <Option value="Kenya">Kenya</Option>
              <Option value="USA">USA</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Account Type" rules={[{ required: true }]}>
            <Select>
              <Option value="Individual">Individual</Option>
              <Option value="Buyer">Buyer</Option>
              <Option value="Supplier">Supplier</Option>
              <Option value="Logistics">Logistics</Option>
            </Select>
          </Form.Item>

          <Button
            block
            style={{
              background: "#0F3952",
              color: "#fff",
              height: 40,
              borderRadius: 6,
            }}
            onClick={handleEditUser}
          >
            Update User
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
