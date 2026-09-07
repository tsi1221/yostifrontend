import React, { useEffect, useState } from "react";
import { Table, Tag, Spin, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useVisaAdmin, type Invitation, type InvitationStatus } from "../../VisitorPublicUser/hooks/useVisaAdmin";

const Visa: React.FC = () => {
  const { invitations, loading, fetchAllInvitations, updateInvitationStatus } = useVisaAdmin();
  const [updatingId, setUpdatingId] = useState<string | null>(null); // Track which row is updating

  useEffect(() => {
    fetchAllInvitations();
  }, [fetchAllInvitations]);

  const handleStatusChange = async (invitationId: string, status: Exclude<InvitationStatus, "pending">) => {
    setUpdatingId(invitationId);
    await updateInvitationStatus(invitationId, status);
    setUpdatingId(null);
  };

  const columns: ColumnsType<Invitation> = [
    { title: "Passport", dataIndex: "passportNumber", key: "passportNumber" },
    { title: "Nationality", dataIndex: "nationality", key: "nationality" },
    {
      title: "Planned Arrival",
      dataIndex: "plannedArrivalDate",
      key: "plannedArrivalDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Duration (days)", dataIndex: "durationDays", key: "durationDays" },
    { title: "Purpose", dataIndex: "purpose", key: "purpose" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: InvitationStatus) => {
        const color = status === "pending" ? "orange" : status === "approved" ? "green" : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isUpdating = updatingId === record._id;
        return (
          <Space>
            <Button
              type="primary"
              disabled={record.status === "approved" || isUpdating}
              onClick={() => handleStatusChange(record._id, "approved")}
            >
              {isUpdating && record.status !== "approved" ? <Spin size="small" /> : "Approve"}
            </Button>
            <Button
              danger
              disabled={record.status === "rejected" || isUpdating}
              onClick={() => handleStatusChange(record._id, "rejected")}
            >
              {isUpdating && record.status !== "rejected" ? <Spin size="small" /> : "Reject"}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <h1>Visa Invitations</h1>
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={invitations}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 5 }}
        />
      )}
    </div>
  );
};

export default Visa;
