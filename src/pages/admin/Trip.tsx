import { useState } from "react";
import { Table, Select } from "antd";
import dayjs from "dayjs";
import { useTripAdmin, type BusinessTrip, type TripStatus } from "../../VisitorPublicUser/hooks/useTripAdmin";

const { Option } = Select;

export default function Trip() {
  const { trips, loading, updateTripStatus } = useTripAdmin();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Format Trip ID as TRP-xxxxxx
  const formatTripId = (id: string) => `TRP-${id.slice(-6).toUpperCase()}`;

  const handleStatusChange = async (tripId: string, status: TripStatus) => {
    setUpdatingId(tripId);
    await updateTripStatus(tripId, status);
    setUpdatingId(null);
  };

  const columns = [
    {
      title: "Trip ID",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => formatTripId(id),
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: BusinessTrip["user"]) =>
        typeof user === "string" ? user : user.fullName,
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
      render: (status: TripStatus, record: BusinessTrip) => (
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={val => handleStatusChange(record._id, val)}
          loading={updatingId === record._id}
        >
          <Option value="planned">Planned</Option>
          <Option value="ongoing">Ongoing</Option>
          <Option value="completed">Completed</Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-6">All Trips</h1>
      <Table
        dataSource={trips}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, position: ["bottomRight"] }}
      />
    </div>
  );
}
