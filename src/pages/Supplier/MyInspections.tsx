// src/pages/supplier/MyInspections.tsx
import { useState } from "react";
import { Table, Button, Modal, Space, message, Tag, Input, Upload } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface InspectionRequest {
  request_id: string;
  supplier_id: string;
  product_type: string;
  inspection_type: string;
  date: string;
  media_required: "Photo" | "Video" | "Photo & Video";
  status: "Pending" | "Accepted" | "Rejected";
  response?: { remarks: string; files?: any[]; created_at: string };
}

const initialRequests: InspectionRequest[] = [
  {
    request_id: "IR-001",
    supplier_id: "SUP-001",
    product_type: "Textiles",
    inspection_type: "Quality Check",
    date: "2025-11-28",
    media_required: "Photo & Video",
    status: "Pending",
  },
  {
    request_id: "IR-002",
    supplier_id: "SUP-002",
    product_type: "Electronics",
    inspection_type: "Safety Check",
    date: "2025-11-30",
    media_required: "Photo",
    status: "Pending",
  },
];

export default function MyInspections() {
  const [requests, setRequests] = useState<InspectionRequest[]>(initialRequests);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InspectionRequest | null>(null);
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const handleAccept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.request_id === id ? { ...r, status: "Accepted" } : r))
    );
    message.success("Inspection request accepted!");
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.request_id === id ? { ...r, status: "Rejected" } : r))
    );
    message.warning("Inspection request rejected!");
  };

  const handleSubmitResponse = () => {
    if (!remarks.trim()) {
      message.error("Remarks cannot be empty.");
      return;
    }
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === selectedRequest.request_id
            ? {
                ...r,
                response: { remarks, files, created_at: new Date().toISOString() },
              }
            : r
        )
      );
      setFormModalVisible(false);
      setRemarks("");
      setFiles([]);
      message.success("Inspection response submitted!");
    }
  };

  const columns = [
    { title: "Request ID", dataIndex: "request_id", key: "request_id" },
    { title: "Supplier ID", dataIndex: "supplier_id", key: "supplier_id" },
    { title: "Product Type", dataIndex: "product_type", key: "product_type" },
    { title: "Inspection Type", dataIndex: "inspection_type", key: "inspection_type" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    { title: "Media Required", dataIndex: "media_required", key: "media_required" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = status === "Accepted" ? "green" : status === "Rejected" ? "red" : "gold";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: InspectionRequest) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff" }}
            onClick={() => {
              setSelectedRequest(record);
              setViewModalVisible(true);
            }}
          />
          {record.status === "Pending" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                style={{ backgroundColor: "green", borderColor: "green", color: "#fff" }}
                onClick={() => handleAccept(record.request_id)}
              >
                Accepted
              </Button>
              <Button
                type="primary"
                icon={<CloseOutlined />}
                size="small"
                style={{ backgroundColor: "red", borderColor: "red", color: "#fff" }}
                onClick={() => handleReject(record.request_id)}
              >
                Rejected
              </Button>
            </>
          )}
          {record.status === "Accepted" && !record.response && (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff" }}
              onClick={() => {
                setSelectedRequest(record);
                setFormModalVisible(true);
              }}
            >
              Submit Response
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">My Inspections</h1>

      <Table
        dataSource={requests}
        columns={columns}
        rowKey="request_id"
        pagination={{ pageSize: 5 }}
        bordered
      />

      {/* View Modal */}
      <Modal
        title="Inspection Request Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Button
            size="small"
            style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff" }}
            onClick={() => setViewModalVisible(false)}
          >
            Close
          </Button>
        }
      >
        {selectedRequest && (
          <div className="space-y-2">
            <p><strong>Request ID:</strong> {selectedRequest.request_id}</p>
            <p><strong>Supplier ID:</strong> {selectedRequest.supplier_id}</p>
            <p><strong>Product Type:</strong> {selectedRequest.product_type}</p>
            <p><strong>Inspection Type:</strong> {selectedRequest.inspection_type}</p>
            <p><strong>Date:</strong> {dayjs(selectedRequest.date).format("YYYY-MM-DD")}</p>
            <p><strong>Photo/Video Required:</strong> {selectedRequest.media_required}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>

            {selectedRequest.response && (
              <div className="mt-2 p-2 border border-gray-200 rounded">
                <p><strong>Remarks:</strong> {selectedRequest.response.remarks}</p>
                {selectedRequest.response.files?.map((file: any, idx: number) => {
                  const url = URL.createObjectURL(file);
                  if (file.type.startsWith("image/")) {
                    return <img key={idx} src={url} alt="inspection" className="w-full rounded mb-2" />;
                  } else if (file.type.startsWith("video/")) {
                    return (
                      <video key={idx} src={url} controls className="w-full rounded mb-2" />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Submit Response Modal */}
      <Modal
        title="Submit Inspection Response"
        visible={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        footer={null}
      >
        <Input.TextArea
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter your inspection remarks"
        />
        <Upload
          fileList={files}
          beforeUpload={(file) => {
            setFiles((prev) => [...prev, file]);
            return false;
          }}
          onRemove={(file) => setFiles((prev) => prev.filter((f) => f.uid !== file.uid))}
        >
          <Button icon={<UploadOutlined />} size="small" style={{ marginTop: 8 }}>
            Upload Photo/Video
          </Button>
        </Upload>
        <Button
          type="primary"
          block
          style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#fff", marginTop: 10 }}
          onClick={handleSubmitResponse}
        >
          Submit
        </Button>
      </Modal>
    </div>
  );
}
