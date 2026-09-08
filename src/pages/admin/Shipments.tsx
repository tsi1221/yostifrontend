import { useState } from "react";
import {
  Table, Drawer, Button, Space, Tag, Select, 
  Form, Input, InputNumber, DatePicker, 
  message, Timeline, Card, Spin, Tooltip
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  EyeOutlined, 
  PlusCircleOutlined, 
  ContainerOutlined,
  EditOutlined,
  UserAddOutlined,
  GlobalOutlined,
  CloseOutlined,
  RadarChartOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { useShipmentAdmin, type Shipment } from "../../VisitorPublicUser/hooks/useShipmentAdmin";

const { Option } = Select;

export default function ShipmentsAdmin() {
  const {
    shipments,
    loading,
    getShipmentById,
    assignLogistic,
    updateShipment,
    addShipmentUpdate,
    fetchShipments,
  } = useShipmentAdmin();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [mode, setMode] = useState<"view" | "assign" | "update" | "addUpdate">("view");
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [form] = Form.useForm();

  const openDrawer = async (m: "view" | "assign" | "update" | "addUpdate", s: Shipment) => {
    setDrawerLoading(true);
    setDrawerOpen(true);
    setMode(m);
    
    try {
      const full = await getShipmentById(s._id);
      if (full) {
        setSelected(full);
        form.resetFields();
        form.setFieldsValue({
          ...full,
          estimatedDeliveryDate: full.estimatedDeliveryDate ? dayjs(full.estimatedDeliveryDate) : null,
          statusUpdate: full.status 
        });
      }
    } catch (err) {
      message.error("Failed to fetch shipment details");
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!selected) return;
    setDrawerLoading(true);
    try {
      if (mode === "assign") {
        await assignLogistic(selected._id, values.assignedLogistic);
        message.success("Logistic partner assigned");
      } else if (mode === "update") {
        const payload = {
          ...values,
          estimatedDeliveryDate: values.estimatedDeliveryDate?.format("YYYY-MM-DD"),
        };
        await updateShipment(selected._id, payload);
        message.success("Shipment details updated");
      } else if (mode === "addUpdate") {
        await addShipmentUpdate(selected._id, {
          location: values.location,
          status: values.statusUpdate,
          remarks: values.remarks,
        });
        message.success("Tracking update posted");
      }
      setDrawerOpen(false);
      fetchShipments();
    } catch (err) {
      message.error("Operation failed");
    } finally {
      setDrawerLoading(false);
    }
  };

  const columns: ColumnsType<Shipment> = [
    {
      title: <span className="text-[12px] uppercase tracking-[0.2em] text-slate-400 font-black">Tracking Unit</span>,
      dataIndex: "trackingNumber",
      render: (t) => t ? (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 transition-all group-hover:shadow-md">
            <ContainerOutlined className="text-indigo-500 text-lg" />
          </div>
          <b className="text-[#0F172A] font-mono text-sm uppercase tracking-tighter">{t}</b>
        </div>
      ) : (
        <Tag className="border-dashed bg-slate-100 text-slate-400 text-[10px] font-black px-4 py-1">PENDING_ID</Tag>
      ),
    },
    {
      title: <span className="text-[12px] uppercase tracking-[0.2em] text-slate-400 font-black">Route Node</span>,
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-black text-[#0F172A] text-sm uppercase">{r.destinationCity}</span>
          <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-tight flex items-center gap-1">
            <GlobalOutlined size={12} /> {r.destinationCountry}
          </span>
        </div>
      ),
    },
    {
      title: <span className="text-[12px] uppercase tracking-[0.2em] text-slate-400 font-black">Live Status</span>,
      dataIndex: "status",
      render: (s: string) => {
        const colors: Record<string, string> = {
          booked: "#3b82f6", "in-transit": "#f59e0b", "at-port": "#06b6d4",
          customs: "#8b5cf6", delivered: "#10b981", cancelled: "#ef4444"
        };
        return (
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors[s] || "#64748b" }} />
            <span className="uppercase font-black text-[11px] tracking-widest" style={{ color: colors[s] || "#64748b" }}>
              {s}
            </span>
          </div>
        );
      },
    },
    {
      title: <span className="text-[12px] uppercase tracking-[0.2em] text-slate-400 font-black text-right block">Command</span>,
      align: 'right',
      render: (_, r) => (
        <Space size={12}>
          <Tooltip title="View Log">
            <Button 
              shape="circle"
              className="border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 h-10 w-10 flex items-center justify-center"
              icon={<EyeOutlined style={{ fontSize: '16px' }} />} 
              onClick={() => openDrawer("view", r)} 
            />
          </Tooltip>
          <Tooltip title="Add Milestone">
            <Button 
              shape="circle"
              className="border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-600 h-10 w-10 flex items-center justify-center"
              icon={<PlusCircleOutlined style={{ fontSize: '16px' }} />} 
              onClick={() => openDrawer("addUpdate", r)} 
            />
          </Tooltip>
          <Tooltip title="Assign Carrier">
            <Button 
              shape="circle"
              className="border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-600 h-10 w-10 flex items-center justify-center"
              icon={<UserAddOutlined style={{ fontSize: '16px' }} />} 
              onClick={() => openDrawer("assign", r)} 
            />
          </Tooltip>
          <Tooltip title="Edit Metadata">
            <Button 
              shape="circle"
              className="border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-900 h-10 w-10 flex items-center justify-center"
              icon={<EditOutlined style={{ fontSize: '16px' }} />} 
              onClick={() => openDrawer("update", r)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-10 bg-[#F8FAFC] min-h-screen font-sans"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex items-center gap-5">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-200">
            <RadarChartOutlined className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter m-0 uppercase">
              Yosti <span className="text-indigo-600">Shipment</span>
            </h1>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">
              Operational Terminal Admin
            </p>
          </div>
        </header>

        <Card 
          bordered={false} 
          className="shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden border border-white"
          bodyStyle={{ padding: 0 }}
        >
          <Table
            rowKey="_id"
            loading={loading}
            dataSource={shipments}
            columns={columns}
            pagination={{ 
              pageSize: 8, 
              className: "px-10 py-8",
              showSizeChanger: false
            }}
          />
        </Card>
      </div>

      <Drawer
        title={
          <div className="flex flex-col py-2">
             <span className="text-[11px] text-indigo-500 font-black uppercase tracking-[0.4em] mb-2">System Command</span>
             <h3 className="text-[#0F172A] font-black uppercase text-2xl m-0">{mode.replace(/([A-Z])/g, ' $1')}</h3>
          </div>
        }
        open={drawerOpen}
        width={450}
        onClose={() => setDrawerOpen(false)}
        closeIcon={<CloseOutlined className="text-slate-400 hover:text-red-500 transition-colors text-xl" />}
        contentWrapperStyle={{ borderLeft: '1px solid #e2e8f0' }}
      >
        <Spin spinning={drawerLoading}>
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div 
                key={mode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {mode === "view" ? (
                  <>
                    <div className="bg-[#0F172A] p-8 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-indigo-900/30">
                      <div className="relative z-10">
                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Electronic Manifest</p>
                        <p className="font-mono text-2xl font-black text-white mb-8 tracking-tight">{selected.trackingNumber || "ID_PENDING"}</p>
                        
                        <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Carrier</p>
                            <p className="text-[14px] font-black text-white uppercase">{selected.assignedLogistic || "Awaiting..."}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Node Status</p>
                            <p className="text-[14px] font-black text-indigo-400 uppercase">{selected.status}</p>
                          </div>
                        </div>
                      </div>
                      <RadarChartOutlined className="absolute -right-10 -bottom-10 text-white/5 text-[14rem] rotate-12" />
                    </div>

                    <div className="px-4">
                      <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Transit Timeline</h4>
                      <Timeline
                        items={selected.updates?.map((u, idx) => ({
                          color: idx === 0 ? '#4F46E5' : '#CBD5E1',
                          children: (
                            <div className="pb-8">
                              <div className="font-black text-slate-800 text-[14px] uppercase tracking-wide">{u.status}</div>
                              <div className="text-[11px] font-bold text-indigo-500 uppercase mt-2">
                                {u.location} • {dayjs(u.update_time).format("DD MMM, HH:mm")}
                              </div>
                              {u.remarks && <p className="mt-4 text-[13px] text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic leading-relaxed">"{u.remarks}"</p>}
                            </div>
                          )
                        }))}
                      />
                    </div>
                  </>
                ) : (
                  <Form form={form} layout="vertical" onFinish={onFinish}>
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-6">
                      {mode === "assign" && (
                        <Form.Item name="assignedLogistic" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Logistic Partner</span>} rules={[{ required: true }]}>
                          <Select size="large" placeholder="SELECT CARRIER" className="h-12 text-lg">
                            <Option value="DHL">DHL AVIATION</Option>
                            <Option value="Maersk">MAERSK OCEAN</Option>
                            <Option value="FedEx">FEDEX NETWORK</Option>
                          </Select>
                        </Form.Item>
                      )}

                      {mode === "addUpdate" && (
                        <div className="space-y-6">
                          <Form.Item name="statusUpdate" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Next Milestone</span>} rules={[{ required: true }]}>
                            <Select size="large" className="h-12">
                              <Option value="In Transit">IN TRANSIT</Option>
                              <Option value="Port Arrival">PORT ARRIVAL</Option>
                              <Option value="Customs Cleared">CUSTOMS CLEARED</Option>
                              <Option value="Delivered">DELIVERED</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item name="location" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Current Node</span>} rules={[{ required: true }]}>
                            <Input size="large" placeholder="CITY, COUNTRY" className="h-12" />
                          </Form.Item>
                          <Form.Item name="remarks" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Operational Remarks</span>}>
                            <Input.TextArea rows={4} placeholder="Detailed notes..." className="rounded-2xl text-base" />
                          </Form.Item>
                        </div>
                      )}

                      {mode === "update" && (
                        <div className="grid grid-cols-2 gap-6">
                          <Form.Item className="col-span-2" name="status" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">System Status</span>}>
                            <Select size="large" className="h-12">
                              <Option value="booked">BOOKED</Option>
                              <Option value="in-transit">IN TRANSIT</Option>
                              <Option value="delivered">DELIVERED</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item name="weight" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Weight (KG)</span>}>
                            <InputNumber size="large" className="w-full h-12 flex items-center" />
                          </Form.Item>
                          <Form.Item name="volume" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Vol (CBM)</span>}>
                            <InputNumber size="large" className="w-full h-12 flex items-center" />
                          </Form.Item>
                          <Form.Item className="col-span-2" name="estimatedDeliveryDate" label={<span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Target ETA</span>}>
                            <DatePicker size="large" className="w-full h-12" />
                          </Form.Item>
                        </div>
                      )}
                    </div>

                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      className="bg-[#0F172A] h-16 font-black uppercase text-base tracking-[0.3em] rounded-2xl shadow-2xl shadow-slate-200 border-0 hover:bg-indigo-600 transition-all active:scale-[0.98]"
                    >
                      EXECUTE_{mode.toUpperCase()}
                    </Button>
                  </Form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Spin>
      </Drawer>
    </motion.div>
  );
}