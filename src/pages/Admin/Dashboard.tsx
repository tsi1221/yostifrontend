import React, { useState } from "react";
import { Table, Button, Drawer, Form, Input, Switch, Tag, Spin, Space } from "antd";
import { 
  EditOutlined, EyeOutlined, DeleteOutlined, UserOutlined, 
  ShopOutlined, SafetyOutlined, DollarOutlined, PhoneOutlined, 
  GlobalOutlined 
} from "@ant-design/icons";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import type { Supplier, User } from "./adminTypesDashboard";

const { Column } = Table;

// Stat Card Component
const StatCard = ({
  title,
  value,
  gradient,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  gradient: string;
  icon: React.ReactNode;
  trend: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-5 text-white shadow-lg ${gradient} transition-transform hover:scale-[1.02]`}
  >
    <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
          {icon}
        </div>
        <div className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold backdrop-blur-md">
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { users, suppliers, stats, loading, updateUser, deleteUser, updateSupplier, deleteSupplier } = useAdminDashboard();
  const [activeTab, setActiveTab] = useState<"users" | "suppliers">("users");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: "user" | "supplier"; data: any } | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [form] = Form.useForm();

  const openDrawer = (type: "user" | "supplier", record: any, view = false) => {
    setViewMode(view);
    setEditingItem({ type, data: record });
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleSave = async () => {
    const values = form.getFieldsValue();
    if (editingItem?.type === "user") await updateUser(editingItem.data._id, values);
    else if (editingItem?.type === "supplier") await updateSupplier(editingItem.data._id, values);
    setDrawerVisible(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-3 md:p-8">
      {loading ? (
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <p className="text-slate-500 font-medium animate-pulse">Fetching records...</p>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl">
          {/* Stat Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            <StatCard title="Revenue" value={`$${stats.totalPayments.toLocaleString()}`} gradient="bg-[#1e293b]" icon={<DollarOutlined />} trend="+12%" />
            <StatCard title="Users" value={stats.totalUsers} gradient="bg-[#4f46e5]" icon={<UserOutlined />} trend="Active" />
            <StatCard title="Suppliers" value={stats.totalSuppliers} gradient="bg-[#0ea5e9]" icon={<ShopOutlined />} trend="Global" />
            <StatCard title="Trust Verified" value={stats.verifications} gradient="bg-[#10b981]" icon={<SafetyOutlined />} trend="High" />
          </div>

          {/* Table Section */}
          <div className="rounded-[2rem] bg-white p-4 md:p-6 shadow-xl border border-slate-200">
            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 mb-6 bg-slate-100 rounded-2xl w-full sm:w-fit">
              <button
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${
                  activeTab === "users" ? "bg-[#0F3952] text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users
              </button>
              <button
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${
                  activeTab === "suppliers" ? "bg-[#0F3952] text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("suppliers")}
              >
                Suppliers
              </button>
            </div>

            <div className="overflow-hidden">
              {activeTab === "users" ? (
                <Table<User> dataSource={users} rowKey="_id" pagination={{ pageSize: 8, responsive: true }} scroll={{ x: 1000 }}>
                  <Column
                    title="User Profile"
                    key="userInfo"
                    fixed="left"
                    render={(record: User) => (
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 items-center justify-center font-bold border border-indigo-100">
                          {record.fullName?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{record.fullName}</div>
                          <div className="text-[11px] text-slate-400">{record.email}</div>
                        </div>
                      </div>
                    )}
                  />
                  {/* Dedicated Columns */}
                  <Column title="Phone" key="phone" render={(record: User) => <span className="text-xs font-medium text-slate-700"><PhoneOutlined className="mr-1" />{record.phone || "N/A"}</span>} />
                  <Column title="Location" key="location" render={(record: User) => <span className="text-[11px] text-slate-400"><GlobalOutlined className="mr-1" />{record.country || "N/A"}</span>} />
                  <Column title="Company" dataIndex="companyName" key="companyName" render={(val) => val || "-"} />
                  <Column title="Status" dataIndex="accountType" key="accountType" render={(type) => (
                    <Tag className="rounded-lg border-0 bg-slate-100 text-slate-600 font-semibold px-2 uppercase text-[10px]">{type}</Tag>
                  )} />
                  <Column
                    title="Actions"
                    key="actions"
                    align="right"
                    fixed="right"
                    render={(_: any, record: User) => (
                      <Space>
                        <Button type="text" shape="circle" icon={<EyeOutlined className="text-blue-500" />} onClick={() => openDrawer("user", record, true)} />
                        <Button type="text" shape="circle" icon={<EditOutlined className="text-indigo-600" />} onClick={() => openDrawer("user", record)} />
                        <Button type="text" shape="circle" danger icon={<DeleteOutlined />} onClick={() => deleteUser(record._id)} />
                      </Space>
                    )}
                  />
                </Table>
              ) : (
                <Table<Supplier> dataSource={suppliers} rowKey="_id" pagination={{ pageSize: 8 }} scroll={{ x: 1000 }}>
                  <Column title="Supplier" dataIndex="name" key="name" className="font-bold text-slate-800" />
                  <Column title="Phone" dataIndex="phone" key="phone" />
                  <Column title="Location" key="location" render={(record: Supplier) => `${record.locationCity || "-"}, ${record.locationCity || "-"}`} />
                  <Column title="Trust Status" dataIndex="verified" key="verified" render={(v: boolean) => (
                    <Tag color={v ? "green" : "orange"} className="rounded-full border-0 px-3 font-bold">{v ? "Verified" : "Pending"}</Tag>
                  )} />
                  <Column
                    title="Actions"
                    key="actions"
                    align="right"
                    render={(_: any, record: Supplier) => (
                      <Space>
                        <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => openDrawer("supplier", record, true)} />
                        <Button type="text" shape="circle" icon={<EditOutlined className="text-indigo-600" />} onClick={() => openDrawer("supplier", record)} />
                        <Button type="text" shape="circle" danger icon={<DeleteOutlined />} onClick={() => deleteSupplier(record._id)} />
                      </Space>
                    )}
                  />
                </Table>
              )}
            </div>
          </div>

          {/* Drawer */}
          <Drawer
            title={<span className="text-xl font-bold text-slate-800">{viewMode ? "Review Detail" : "Update Profile"}</span>}
            width={400}                  // Fixed width 400px
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            className="!rounded-none"    // Remove all rounding
            footer={!viewMode && (
              <div className="p-2">
                <Button
                  type="primary"
                  onClick={handleSave}
                  className="h-12 w-full rounded-2xl bg-[#0F3952] font-bold text-white shadow-lg border-0"
                >
                  Update Information
                </Button>
              </div>
            )}
          >
            <Form form={form} layout="vertical" className="px-2">
              {editingItem?.type === "user" ? (
                <>
                  <Form.Item name="fullName" label="Full Name"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                  <Form.Item name="email" label="Email Address"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="phone" label="Phone"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                    <Form.Item name="country" label="Country"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                  </div>
                  <Form.Item name="companyName" label="Linked Company"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                </>
              ) : (
                <>
                  <Form.Item name="name" label="Legal Entity Name"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                  <Form.Item name="phone" label="Contact Phone"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="locationCity" label="City"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                    <Form.Item name="locationCountry" label="Country"><Input className="rounded-xl h-11" disabled={viewMode} /></Form.Item>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-700">Trust Status</span>
                    <Form.Item name="verified" valuePropName="checked" className="mb-0">
                      <Switch disabled={viewMode} />
                    </Form.Item>
                  </div>
                </>
              )}
            </Form>
          </Drawer>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
