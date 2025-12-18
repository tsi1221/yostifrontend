// src/pages/superAdmin/BusinessTrips.tsx
import  { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Tabs,
  Modal,
  Drawer,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Switch,
  message,
} from "antd";
import dayjs from "dayjs";

const { TabPane } = Tabs;

interface BusinessTrip {
  trip_id: string;
  user_id: string;
  arrival_city: string;
  arrival_date: string;
  duration_days: number;
  hotel_booking: boolean;
  transport: boolean;
  translator: boolean;
  status: "planned" | "ongoing" | "completed";
  created_at: string;
}

interface VisaInvitation {
  visa_id: string;
  user_id: string;
  passport_number: string;
  nationality: string;
  planned_arrival_date: string;
  duration_days: number;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const initialBusinessTrips: BusinessTrip[] = [
  {
    trip_id: "TRP-001",
    user_id: "USR-001",
    arrival_city: "Addis Ababa",
    arrival_date: "2025-12-10",
    duration_days: 5,
    hotel_booking: true,
    transport: true,
    translator: false,
    status: "planned",
    created_at: "2025-11-25",
  },
];

const initialVisaInvitations: VisaInvitation[] = [
  {
    visa_id: "VISA-001",
    user_id: "USR-001",
    passport_number: "P123456789",
    nationality: "Ethiopian",
    planned_arrival_date: "2025-12-10",
    duration_days: 5,
    purpose: "Business Meeting",
    status: "pending",
    created_at: "2025-11-25",
  },
];

export default function BusinessTrips() {
  const [businessTrips, setBusinessTrips] = useState<BusinessTrip[]>(initialBusinessTrips);
  const [visaInvitations, setVisaInvitations] = useState<VisaInvitation[]>(initialVisaInvitations);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"trip" | "visa">("trip");
  const [selectedEntry, setSelectedEntry] = useState<BusinessTrip | VisaInvitation | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<"trip" | "visa">("trip");

  const [form] = Form.useForm();

  // Open drawer for requesting new entry
  const openDrawer = (type: "trip" | "visa") => {
    setDrawerType(type);
    setDrawerVisible(true);
    form.resetFields();
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    form.resetFields();
  };

  // Open modal for view/edit
  const openModal = (type: "trip" | "visa", record?: BusinessTrip | VisaInvitation, edit = false) => {
    setModalType(type);
    setSelectedEntry(record || null);
    setIsEditing(edit);
    if (record) {
      form.setFieldsValue({
        ...record,
        arrival_date: "arrival_date" in record ? dayjs(record.arrival_date) : undefined,
        planned_arrival_date: "planned_arrival_date" in record ? dayjs(record.planned_arrival_date) : undefined,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEntry(null);
    setIsEditing(false);
    form.resetFields();
  };

  // Handle request submit in drawer
  const handleRequestSubmit = (values: any) => {
    if (drawerType === "trip") {
      const newTrip: BusinessTrip = {
        trip_id: `TRP-${businessTrips.length + 1}`.padStart(6, "0"),
        user_id: "USR-000",
        arrival_city: values.arrival_city,
        arrival_date: values.arrival_date.format("YYYY-MM-DD"),
        duration_days: values.duration_days,
        hotel_booking: values.hotel_booking,
        transport: values.transport,
        translator: values.translator,
        status: "planned",
        created_at: dayjs().format("YYYY-MM-DD"),
      };
      setBusinessTrips([newTrip, ...businessTrips]);
      message.success("Business Trip request sent successfully!");
    } else {
      const newVisa: VisaInvitation = {
        visa_id: `VISA-${visaInvitations.length + 1}`.padStart(6, "0"),
        user_id: "USR-000",
        passport_number: values.passport_number,
        nationality: values.nationality,
        planned_arrival_date: values.planned_arrival_date.format("YYYY-MM-DD"),
        duration_days: values.duration_days,
        purpose: values.purpose,
        status: "pending",
        created_at: dayjs().format("YYYY-MM-DD"),
      };
      setVisaInvitations([newVisa, ...visaInvitations]);
      message.success("Visa Invitation request sent successfully!");
    }
    closeDrawer();
  };

  // Handle modal submit (edit)
  const handleSubmit = (values: any) => {
    if (!selectedEntry) return;

    if (modalType === "trip") {
      setBusinessTrips(prev =>
        prev.map(trip =>
          trip.trip_id === (selectedEntry as BusinessTrip).trip_id
            ? {
                ...trip,
                arrival_city: values.arrival_city,
                arrival_date: values.arrival_date.format("YYYY-MM-DD"),
                duration_days: values.duration_days,
                hotel_booking: values.hotel_booking,
                transport: values.transport,
                translator: values.translator,
              }
            : trip
        )
      );
      message.success("Business Trip updated!");
    } else {
      setVisaInvitations(prev =>
        prev.map(visa =>
          visa.visa_id === (selectedEntry as VisaInvitation).visa_id
            ? {
                ...visa,
                passport_number: values.passport_number,
                nationality: values.nationality,
                planned_arrival_date: values.planned_arrival_date.format("YYYY-MM-DD"),
                duration_days: values.duration_days,
                purpose: values.purpose,
              }
            : visa
        )
      );
      message.success("Visa Invitation updated!");
    }
    closeModal();
  };

  // Delete entry
  const handleDelete = (id: string, type: "trip" | "visa") => {
    if (type === "trip") setBusinessTrips(prev => prev.filter(trip => trip.trip_id !== id));
    else setVisaInvitations(prev => prev.filter(visa => visa.visa_id !== id));
    message.success("Deleted successfully!");
  };

  // Update statuses
  const updateTripStatus = (trip_id: string, status: BusinessTrip["status"]) => {
    setBusinessTrips(prev => prev.map(t => (t.trip_id === trip_id ? { ...t, status } : t)));
    message.success(`Trip status updated to ${status.toUpperCase()}`);
  };

  const updateVisaStatus = (visa_id: string, status: VisaInvitation["status"]) => {
    setVisaInvitations(prev => prev.map(v => (v.visa_id === visa_id ? { ...v, status } : v)));
    message.success(`Visa ${status.toUpperCase()}`);
    console.log(`Email sent: Visa ${visa_id} has been ${status}.`);
  };

  // Columns
  const tripColumns = [
    { title: "Trip ID", dataIndex: "trip_id", key: "trip_id" },
    { title: "User ID", dataIndex: "user_id", key: "user_id" },
    { title: "Arrival City", dataIndex: "arrival_city", key: "arrival_city" },
    {
      title: "Arrival Date",
      dataIndex: "arrival_date",
      key: "arrival_date",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    { title: "Duration", dataIndex: "duration_days", key: "duration_days" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: BusinessTrip["status"]) => {
        let color = "default";
        if (status === "planned") color = "blue";
        else if (status === "ongoing") color = "orange";
        else if (status === "completed") color = "green";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BusinessTrip) => (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => openModal("trip", record)}>View</Button>
          <Button style={{ backgroundColor: "orange" }} onClick={() => openModal("trip", record, true)}>
            Edit
          </Button>
          <Button style={{ backgroundColor: "red", color: "#fff" }} onClick={() => handleDelete(record.trip_id, "trip")}>
            Delete
          </Button>
          {record.status !== "ongoing" && <Button onClick={() => updateTripStatus(record.trip_id, "ongoing")}>Start</Button>}
          {record.status !== "completed" && <Button onClick={() => updateTripStatus(record.trip_id, "completed")}>Complete</Button>}
        </div>
      ),
    },
  ];

  const visaColumns = [
    { title: "Visa ID", dataIndex: "visa_id", key: "visa_id" },
    { title: "User ID", dataIndex: "user_id", key: "user_id" },
    { title: "Passport No.", dataIndex: "passport_number", key: "passport_number" },
    { title: "Nationality", dataIndex: "nationality", key: "nationality" },
    {
      title: "Planned Arrival",
      dataIndex: "planned_arrival_date",
      key: "planned_arrival_date",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    { title: "Duration", dataIndex: "duration_days", key: "duration_days" },
    { title: "Purpose", dataIndex: "purpose", key: "purpose" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: VisaInvitation["status"]) => {
        let color = "default";
        if (status === "pending") color = "orange";
        else if (status === "approved") color = "green";
        else if (status === "rejected") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: VisaInvitation) => (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => openModal("visa", record)}>View</Button>
          <Button style={{ backgroundColor: "orange" }} onClick={() => openModal("visa", record, true)}>
            Edit
          </Button>
          <Button style={{ backgroundColor: "red", color: "#fff" }} onClick={() => handleDelete(record.visa_id, "visa")}>
            Delete
          </Button>
          {record.status === "pending" && (
            <>
              <Button type="primary" onClick={() => updateVisaStatus(record.visa_id, "approved")}>Approve</Button>
              <Button danger onClick={() => updateVisaStatus(record.visa_id, "rejected")}>Reject</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Trips & Visa Invitations</h1>
        <div className="flex gap-4">
          <Button style={{ backgroundColor: "#0B2545", color: "#fff" }} onClick={() => openDrawer("trip")}>
            Request Trip
          </Button>
          <Button style={{ backgroundColor: "#0B2545", color: "#fff" }} onClick={() => openDrawer("visa")}>
            Request Visa
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="trips">
        <TabPane tab="Business Trips" key="trips">
          <Table dataSource={businessTrips} columns={tripColumns} rowKey="trip_id" pagination={{ pageSize: 5 }} />
        </TabPane>
        <TabPane tab="Visa Invitations" key="visa">
          <Table dataSource={visaInvitations} columns={visaColumns} rowKey="visa_id" pagination={{ pageSize: 5 }} />
        </TabPane>
      </Tabs>

      {/* Drawer for requesting */}
      <Drawer
        title={drawerType === "trip" ? "Request Business Trip" : "Request Visa Invitation"}
        placement="right"
        width={400}
        onClose={closeDrawer}
        open={drawerVisible}
      >
        <Form form={form} layout="vertical" onFinish={handleRequestSubmit}>
          {drawerType === "trip" ? (
            <>
              <Form.Item name="arrival_city" label="Arrival City" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="arrival_date" label="Arrival Date" rules={[{ required: true }]}><DatePicker style={{ width: "100%" }} /></Form.Item>
              <Form.Item name="duration_days" label="Duration (days)" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={1} /></Form.Item>
              <Form.Item name="hotel_booking" label="Hotel Booking" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="transport" label="Transport" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="translator" label="Translator" valuePropName="checked"><Switch /></Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="passport_number" label="Passport Number" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="planned_arrival_date" label="Planned Arrival Date" rules={[{ required: true }]}><DatePicker style={{ width: "100%" }} /></Form.Item>
              <Form.Item name="duration_days" label="Duration (days)" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={1} /></Form.Item>
              <Form.Item name="purpose" label="Purpose" rules={[{ required: true }]}><Input /></Form.Item>
            </>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ backgroundColor: "#0B2545", color: "#fff" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal for view/edit */}
      <Modal
        title={isEditing ? "Edit Entry" : "View Details"}
        visible={modalVisible}
        onCancel={closeModal}
        footer={isEditing ? [
          <Button key="cancel" onClick={closeModal}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>Submit</Button>
        ] : null}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={!isEditing}>
          {modalType === "trip" && (
            <>
              <Form.Item name="arrival_city" label="Arrival City" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="arrival_date" label="Arrival Date" rules={[{ required: true }]}><DatePicker style={{ width: "100%" }} /></Form.Item>
              <Form.Item name="duration_days" label="Duration (days)" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={1} /></Form.Item>
              <Form.Item name="hotel_booking" label="Hotel Booking" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="transport" label="Transport" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="translator" label="Translator" valuePropName="checked"><Switch /></Form.Item>
            </>
          )}
          {modalType === "visa" && (
            <>
              <Form.Item name="passport_number" label="Passport Number" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="nationality" label="Nationality" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="planned_arrival_date" label="Planned Arrival Date" rules={[{ required: true }]}><DatePicker style={{ width: "100%" }} /></Form.Item>
              <Form.Item name="duration_days" label="Duration (days)" rules={[{ required: true }]}><InputNumber style={{ width: "100%" }} min={1} /></Form.Item>
              <Form.Item name="purpose" label="Purpose" rules={[{ required: true }]}><Input /></Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
