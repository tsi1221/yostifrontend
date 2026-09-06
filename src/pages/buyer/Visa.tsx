import { useState } from "react";
import {
  Table,
  Drawer,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useVisaBuyer } from "../../VisitorPublicUser/hooks/useVisaBuyer";

interface VisaFormValues {
  passportNumber: string;
  nationality: string;
  plannedArrivalDate: dayjs.Dayjs;
  durationDays: number;
  purpose: string;
}

export default function VisaAdmin() {
  const { invitations, loading, requestInvitation } = useVisaBuyer();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm<VisaFormValues>();

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
  };

  const handleAddInvitation = async (values: VisaFormValues) => {
    await requestInvitation({
      passportNumber: values.passportNumber,
      nationality: values.nationality,
      plannedArrivalDate: values.plannedArrivalDate.format("YYYY-MM-DD"),
      durationDays: values.durationDays,
      purpose: values.purpose,
    });
    closeDrawer();
  };

  const columns = [
    { title: "Passport Number", dataIndex: "passportNumber", key: "passportNumber" },
    { title: "Nationality", dataIndex: "nationality", key: "nationality" },
    {
      title: "Planned Arrival",
      dataIndex: "plannedArrivalDate",
      key: "plannedArrivalDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    { title: "Duration (days)", dataIndex: "durationDays", key: "durationDays" },
    { title: "Purpose", dataIndex: "purpose", key: "purpose" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";

        switch (status?.toLowerCase()) {
          case "pending":
            color = "orange";
            break;
          case "approved":
            color = "green";
            break;
          case "rejected":
            color = "red";
            break;
          default:
            color = "blue";
        }

        return <Tag color={color} style={{ fontWeight: 600 }}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Visa Request</h1>
        <Button
          style={{ backgroundColor: "#0B2545", color: "#fff", border: "none" }}
          onClick={openDrawer}
        >
          Request Visa
        </Button>
      </div>

      <Table
        dataSource={invitations}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Drawer
        title="Request New Visa Invitation"
        placement="right"
        width={400}
        onClose={closeDrawer}
        open={drawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleAddInvitation}>
          <Form.Item
            name="passportNumber"
            label="Passport Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nationality"
            label="Nationality"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="plannedArrivalDate"
            label="Planned Arrival Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="durationDays"
            label="Duration (days)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item
            name="purpose"
            label="Purpose of Visit"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ backgroundColor: "#0B2545", color: "#fff", border: "none" }}
              htmlType="submit"
              block
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
