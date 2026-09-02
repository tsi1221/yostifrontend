// src/components/SupportAdmin/SupportTable.tsx
import React from "react";
import { Table, Tag, Empty, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSupportAdmin, type SupportItem, type SupportStatus, type Urgency, type IssueType } from "../../hooks/useSupportAdmin";

const statusColors: Record<SupportStatus, string> = {
  open: "blue",
  "in-progress": "orange",
  resolved: "green",
  closed: "gray",
};

const urgencyColors: Record<Urgency, string> = {
  low: "green",
  medium: "orange",
  high: "red",
};

export const SupportTable: React.FC = () => {
  const { data, pagination, loading, fetchSupport } = useSupportAdmin();

  const columns: ColumnsType<SupportItem> = [
    {
      title: "User",
      key: "user",
      render: (_, record) => record.user.fullName,
    },
    {
      title: "Order Reference",
      dataIndex: "orderReference",
      key: "orderReference",
    },
    {
      title: "Issue Type",
      dataIndex: "issueType",
      key: "issueType",
      render: (issueType: IssueType) => <Tag color="geekblue">{issueType}</Tag>,
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency: Urgency) => <Tag color={urgencyColors[urgency]}>{urgency}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: SupportStatus) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Requested Resolution",
      dataIndex: "resolutionRequested",
      key: "resolutionRequested",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchSupport(page, pageSize ?? 10);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading support requests..." />
      </div>
    );
  }

  if (!data.length) {
    return <Empty description="No support requests found" style={{ marginTop: 50 }} />;
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record) => record._id}
      pagination={{
        current: pagination?.currentPage,
        pageSize: pagination?.pageSize,
        total: pagination?.total,
        onChange: handlePageChange,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20", "50"],
      }}
      bordered
    />
  );
};
