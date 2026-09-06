import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { useTrips, type BusinessTrip } from "../../VisitorPublicUser/hooks/useTrips";

interface TripFormValues {
  arrival_city: string;
  arrival_date: dayjs.Dayjs;
  duration_days: number;
  hotel_booking: boolean;
  transport: boolean;
  translator: boolean;
}

// Helper to display a short Trip ID like TRP-18263
const formatTripId = (id: string) => `TRP-${id.slice(-6).toUpperCase()}`;

export default function MyTrips() {
  const { trips, loading, addTrip } = useTrips();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm<TripFormValues>();

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
  };

  const handleAddTrip = async (values: TripFormValues) => {
    await addTrip({
      user: "USR-001",
      arrivalCity: values.arrival_city,
      arrivalDate: values.arrival_date.format("YYYY-MM-DD"),
      durationDays: values.duration_days,
      hotelBooking: values.hotel_booking,
      transport: values.transport,
      translator: values.translator,
    });
    closeDrawer();
  };

  const columns = [
    {
      title: "Trip ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => formatTripId(id),
    },
    { title: "Arrival City", dataIndex: "arrivalCity", key: "arrivalCity" },
    {
      title: "Arrival Date",
      dataIndex: "arrivalDate",
      key: "arrivalDate",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    { title: "Duration (days)", dataIndex: "durationDays", key: "durationDays" },
    {
      title: "Hotel",
      dataIndex: "hotelBooking",
      key: "hotelBooking",
      render: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      title: "Transport",
      dataIndex: "transport",
      key: "transport",
      render: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      title: "Translator",
      dataIndex: "translator",
      key: "translator",
      render: (val: boolean) => (val ? "Yes" : "No"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: BusinessTrip["status"]) => {
        const color =
          status === "planned" ? "blue" : status === "ongoing" ? "orange" : "green";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button
          style={{ backgroundColor: "#0B2545", color: "#fff", border: "none" }}
          onClick={openDrawer}
        >
          Request Trip
        </Button>
      </div>

      <Table
        dataSource={trips}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ position: ["bottomRight"], pageSize: 5 }}
      />

      <Drawer
        title="Request New Trip"
        placement="right"
        width={400}
        onClose={closeDrawer}
        open={drawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTrip}>
          <Form.Item
            name="arrival_city"
            label="Arrival City"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="arrival_date"
            label="Arrival Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="duration_days"
            label="Duration (days)"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item name="hotel_booking" label="Hotel Booking" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="transport" label="Transport" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="translator" label="Translator" valuePropName="checked">
            <Switch />
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
