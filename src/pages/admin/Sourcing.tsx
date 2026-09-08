import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Drawer, Form, message, Avatar, Radio, Divider } from "antd";
import { 
  CloseOutlined, ShoppingCartOutlined, 
  CheckCircleFilled, ClockCircleFilled, 
  DollarOutlined, InboxOutlined, EyeOutlined 
} from "@ant-design/icons";
import { getSourcingRequests, getSourcingRequestById, updateSourcingRequest } from "../../VisitorPublicUser/hooks/authSourcing";

const StatCard = ({ title, value, gradient, icon }: any) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${gradient}`}>
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-lg">
          {icon}
        </div>
        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{title}</span>
      </div>
      <h3 className="text-2xl font-black m-0">{value}</h3>
    </div>
  </div>
);

const SourcingDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getSourcingRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch { 
      message.error("Failed to load requests"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const openDrawer = async (record: any) => {
    try {
      const details = await getSourcingRequestById(record._id);
      setEditingRequest(details);
      form.setFieldsValue({
        ...details,
        statusLabel: details.status === 'completed' ? 'Complete' : 'Open'
      });
      setDrawerVisible(true);
    } catch { 
      message.error("Could not load details"); 
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { status: values.statusLabel === 'Complete' ? 'completed' : 'open' };
      await updateSourcingRequest(editingRequest._id, payload);
      message.success("Request Status Updated Successfully");
      setDrawerVisible(false);
      fetchRequests();
    } catch { 
      message.error("Update failed"); 
    }
  };

  const columns = [
    {
      title: "Product Detail",
      key: "productName",
      render: (record: any) => (
        <div className="flex items-center gap-3">
          <Avatar shape="square" size={40} className="bg-[#F4F7FE] text-[#0F3952] font-bold border border-slate-200">
            {record.productName?.[0]}
          </Avatar>
          <div className="font-bold text-[#0F3952]">{record.productName}</div>
        </div>
      ),
    },
    { 
        title: "Target Price", 
        dataIndex: "targetPrice", 
        render: (p: any) => <span className="font-bold text-slate-700">${p || 0}</span> 
    },
    { 
        title: "Region", 
        dataIndex: "supplierRegion", 
        render: (r: any) => <Tag className="border-slate-200 bg-slate-50 text-slate-600 font-medium uppercase text-[10px]">{r || 'Any'}</Tag> 
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={s === 'completed' ? 'green' : 'blue'} className="rounded-full border-0 px-3 font-bold uppercase text-[9px]">
            {s === 'completed' ? 'COMPLETED' : 'OPEN'}
        </Tag>
      )
    },
    { 
        title: "Action", 
        align: 'right' as const, 
        render: (record: any) => (
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              className="bg-[#0F3952] hover:bg-[#1a4a69] border-0 text-[11px] font-bold uppercase" 
              onClick={() => openDrawer(record)}
            >
                See Detail
            </Button>
        ) 
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Statistics Section */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Total Requests" value={requests.length} gradient="bg-[#0F3952]" icon={<InboxOutlined />} />
          <StatCard title="Open Items" value={requests.filter(r => r.status === 'open').length} gradient="bg-indigo-600" icon={<ShoppingCartOutlined />} />
          <StatCard title="Market Value" value={`$${requests.reduce((a, b) => a + (b.targetPrice || 0), 0).toLocaleString()}`} gradient="bg-emerald-500" icon={<DollarOutlined />} />
        </div>

        {/* Table Section */}
        <div className="bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-[#0F3952] m-0">Sourcing Management</h2>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Live Inventory</span>
          </div>
          
          <Table 
            loading={loading} 
            dataSource={requests} 
            columns={columns} 
            rowKey="_id" 
            pagination={{ pageSize: 8, showSizeChanger: false, position: ['bottomRight'] }} 
            className="custom-table"
          />
        </div>

        {/* Action Drawer */}
        <Drawer 
          title={<span className="text-lg font-bold text-[#0F3952]">Sourcing Detail</span>} 
          width={400} 
          onClose={() => setDrawerVisible(false)} 
          open={drawerVisible}
          styles={{ 
            body: { padding: 0 }, 
            mask: { backdropFilter: 'blur(4px)' }
          }}
          style={{ borderRadius: 0 }}
          closeIcon={<CloseOutlined />}
        >
          <div className="flex flex-col h-full">
            {/* Header Info */}
            <div className="p-6 bg-slate-50 border-b">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product Name</div>
                <h3 className="text-xl font-black text-[#0F3952] m-0">{editingRequest?.productName}</h3>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Price</div>
                        <div className="text-lg font-bold text-emerald-600">${editingRequest?.targetPrice || 0}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Region</div>
                        <div className="text-lg font-bold text-slate-700">{editingRequest?.supplierRegion || 'Any'}</div>
                    </div>
                </div>
            </div>

            {/* Content / Form */}
            <div className="p-6 flex-grow overflow-y-auto">
              <Form form={form} layout="vertical">
                <Form.Item label={<span className="font-bold text-slate-500 text-xs uppercase">Description</span>}>
                  <div className="p-4 bg-slate-100 border rounded-lg text-slate-700 text-sm leading-relaxed italic">
                    "{editingRequest?.description || "No specific instructions provided for this request."}"
                  </div>
                </Form.Item>

                <Divider />

                <Form.Item 
                  name="statusLabel" 
                  label={<span className="font-bold text-[#0F3952] text-xs uppercase">Update Sourcing Status</span>}
                >
                  <Radio.Group className="w-full flex gap-2">
                    <Radio.Button value="Complete" className="flex-1 h-12 flex items-center justify-center font-bold">
                      <CheckCircleFilled className="text-emerald-500 mr-2" /> Complete
                    </Radio.Button>
                    <Radio.Button value="Open" className="flex-1 h-12 flex items-center justify-center font-bold">
                      <ClockCircleFilled className="text-blue-500 mr-2" /> Open
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Form>
            </div>

            {/* Colored Footer Button */}
            <div className="p-6 border-t bg-white">
                <Button 
                    type="primary"
                    onClick={handleSave} 
                    className="h-14 w-full bg-gradient-to-r from-[#0F3952] to-[#215a7d] hover:from-[#1a4a69] hover:to-[#0F3952] text-white font-black text-sm border-0 shadow-lg"
                    style={{ borderRadius: 0 }}
                >
                  SAVE CHANGES
                </Button>
                <Button 
                    onClick={() => setDrawerVisible(false)} 
                    className="mt-2 h-10 w-full font-bold text-slate-400 border-0 hover:text-red-500"
                >
                  Cancel and Exit
                </Button>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
};

export default SourcingDashboard;