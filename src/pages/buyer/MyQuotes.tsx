// src/pages/buyer/MyQuotes.tsx
import { useState } from "react";
import { Table, Button, Drawer, Input, Space, message } from "antd";
import { EyeOutlined, MessageOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// ================================
// TYPES
// ================================
interface Reply {
  sender: "buyer" | "supplier";
  message: string;
  created_at: string;
}

interface SupplierQuote {
  quote_id: string;
  request_id: string;
  supplier_name: string;
  price: number;
  moq: number;
  lead_time: string;
  notes: string; // supplier note
  created_at: string;
  replies?: Reply[];
}

// ================================
// INITIAL DATA
// ================================
const initialQuotes: SupplierQuote[] = [
  {
    quote_id: "Q-001",
    request_id: "REQ-001",
    supplier_name: "Supplier A",
    price: 2.6,
    moq: 500,
    lead_time: "15 days",
    notes: "Includes shipping to Ethiopia",
    created_at: "2025-10-02T12:00:00Z",
    replies: [
      { sender: "supplier", message: "Includes shipping to Ethiopia", created_at: "2025-10-02T12:00:00Z" }
    ],
  },
  {
    quote_id: "Q-002",
    request_id: "REQ-001",
    supplier_name: "Supplier B",
    price: 2.5,
    moq: 1000,
    lead_time: "20 days",
    notes: "Samples available",
    created_at: "2025-10-03T08:30:00Z",
    replies: [
      { sender: "supplier", message: "Samples available", created_at: "2025-10-03T08:30:00Z" }
    ],
  },
  {
    quote_id: "Q-003",
    request_id: "REQ-002",
    supplier_name: "Supplier C",
    price: 24.5,
    moq: 50,
    lead_time: "10 days",
    notes: "High quality Bluetooth speakers",
    created_at: "2025-10-06T10:15:00Z",
    replies: [
      { sender: "supplier", message: "High quality Bluetooth speakers", created_at: "2025-10-06T10:15:00Z" }
    ],
  },
];

// ================================
// COMPONENT
// ================================
export default function MyQuotes() {
  const [quotes, setQuotes] = useState<SupplierQuote[]>(initialQuotes);
  const [viewDrawer, setViewDrawer] = useState(false);
  const [chatDrawer, setChatDrawer] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [replyText, setReplyText] = useState("");

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns = [
    {
      title: "Request ID",
      dataIndex: "request_id",
      key: "request_id",
      render: (text: string) => <span className="text-[#0A1A4E]">{text}</span>,
    },
    { title: "Supplier", dataIndex: "supplier_name", key: "supplier_name" },
    { title: "Price ($)", dataIndex: "price", key: "price" },
    { title: "MOQ", dataIndex: "moq", key: "moq" },
    { title: "Lead Time", dataIndex: "lead_time", key: "lead_time" },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: SupplierQuote) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            style={{
              backgroundColor: "#0A1A4E",
              borderColor: "#0A1A4E",
              color: "#FFFFFF",
            }}
            onClick={() => {
              setSelectedQuote(record);
              setViewDrawer(true);
            }}
          >
            View
          </Button>
          <Button
            type="default"
            icon={<MessageOutlined />}
            style={{
              backgroundColor: "#FFD700",
              borderColor: "#FFD700",
              color: "#0A1A4E",
              fontWeight: 500,
            }}
            onClick={() => {
              setSelectedQuote(record);
              setReplyText("");
              setChatDrawer(true);
            }}
          >
            Reply
          </Button>
        </Space>
      ),
    },
  ];

  // ================================
  // SEND REPLY
  // ================================
  const handleSendReply = () => {
    if (!replyText.trim()) {
      message.error("Reply cannot be empty.");
      return;
    }
    if (selectedQuote) {
      const updatedQuotes = quotes.map((q) =>
        q.quote_id === selectedQuote.quote_id
          ? {
              ...q,
              replies: [
                ...(q.replies || []),
                { sender: "buyer", message: replyText, created_at: new Date().toISOString() } as Reply,
              ],
            }
          : q
      );
      setQuotes(updatedQuotes);
      setReplyText("");
      message.success("Reply sent successfully!");
    }
  };

  // ================================
  // RENDER
  // ================================
  return (
    <div className="p-6 min-h-screen bg-white">
      <h1 className="text-3xl font-bold text-[#0A1A4E] mb-6">My Quotes</h1>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <Table
          dataSource={quotes}
          columns={columns}
          rowKey="quote_id"
          pagination={{ pageSize: 5, position: ["bottomRight"] }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* View Drawer */}
      <Drawer
        title="Quote Details"
        width={400}
        onClose={() => setViewDrawer(false)}
        open={viewDrawer}
      >
        {selectedQuote && (
          <div className="space-y-2">
            <p>Quote ID: {selectedQuote.quote_id}</p>
            <p>Request ID: {selectedQuote.request_id}</p>
            <p>Supplier: {selectedQuote.supplier_name}</p>
            <p>Price: ${selectedQuote.price}</p>
            <p>MOQ: {selectedQuote.moq}</p>
            <p>Lead Time: {selectedQuote.lead_time}</p>
            <p>Notes: {selectedQuote.notes}</p>
            <p>Created At: {dayjs(selectedQuote.created_at).format("YYYY-MM-DD")}</p>
          </div>
        )}
      </Drawer>

      {/* Chat / Reply Drawer */}
      <Drawer
        title={`Chat with ${selectedQuote?.supplier_name}`}
        width={400}
        onClose={() => setChatDrawer(false)}
        open={chatDrawer}
      >
        {selectedQuote && (
          <div className="flex flex-col h-[70vh] justify-between">
            <div className="overflow-y-auto p-2 flex flex-col gap-3">
              {(selectedQuote.replies || []).map((r, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] p-2 rounded-xl break-words ${
                    r.sender === "buyer"
                      ? "self-end bg-[#0A1A4E] text-[#FFD700]"
                      : "self-start bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{r.message}</p>
                  <p className="text-xs text-right mt-1 opacity-70">
                    {dayjs(r.created_at).format("YYYY-MM-DD HH:mm")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2">
              <Input.TextArea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
              />
              <Button
                block
                style={{
                  marginTop: "8px",
                  backgroundColor: "#0A1A4E",
                  borderColor: "#0A1A4E",
                  color: "#FFD700",
                }}
                onClick={handleSendReply}
              >
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
