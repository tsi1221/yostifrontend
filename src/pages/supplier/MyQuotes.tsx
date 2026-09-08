// src/pages/supplier/MyQuotes.tsx
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  
  message,
  ConfigProvider,
} from "antd";
import { EyeOutlined, MessageOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getSupplierQuotes, sendQuoteReply } from "../../VisitorPublicUser/hooks/authQuoteSupplier";

interface QuoteReply {
  sender: "supplier" | "buyer";
  message: string;
  created_at: string;
}

interface SupplierQuote {
  quote_id: string;
  request_id: string;
  buyer_name: string;
  price: number;
  moq: number;
  lead_time: string;
  notes: string;
  created_at: string;
  replies?: QuoteReply[];
}

export default function MyQuotes() {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<SupplierQuote | null>(null);
  const [replyText, setReplyText] = useState("");

  const buttonStyle = { backgroundColor: "#0F3952", borderColor: "#0F3952", color: "#FFFFFF" };

  // Fetch quotes on mount
  const fetchQuotes = async () => {
    try {
      const data = await getSupplierQuotes();
      setQuotes(data);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to fetch quotes");
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Send reply to backend
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedQuote) {
      message.error("Reply cannot be empty.");
      return;
    }

    try {
      await sendQuoteReply(selectedQuote.request_id, { message: replyText });
      // Update local state
      const newReply: QuoteReply = {
        sender: "supplier",
        message: replyText,
        created_at: new Date().toISOString(),
      };
      setQuotes((prev) =>
        prev.map((q) =>
          q.quote_id === selectedQuote.quote_id
            ? { ...q, replies: [...(q.replies || []), newReply] }
            : q
        )
      );
      setReplyText("");
      message.success("Reply sent successfully!");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to send reply");
    }
  };

  const columns = [
    { title: "Request ID", dataIndex: "request_id", key: "request_id" },
    { title: "Buyer", dataIndex: "buyer_name", key: "buyer_name" },
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
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            style={buttonStyle}
            onClick={() => {
              setSelectedQuote(record);
              setViewModalVisible(true);
            }}
          />
          <Button
            type="default"
            icon={<MessageOutlined />}
            style={buttonStyle}
            onClick={() => {
              setSelectedQuote(record);
              setReplyText("");
              setChatModalVisible(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider>
      <div className="p-6 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">My Quotes</h1>

        <Table
          dataSource={quotes}
          columns={columns}
          rowKey="quote_id"
          pagination={{ pageSize: 5 }}
          bordered
        />

        {/* View Modal */}
        <Modal
          title="Quote Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={<Button style={buttonStyle} onClick={() => setViewModalVisible(false)}>Close</Button>}
        >
          {selectedQuote && (
            <div className="space-y-2">
              <p><strong>Quote ID:</strong> {selectedQuote.quote_id}</p>
              <p><strong>Request ID:</strong> {selectedQuote.request_id}</p>
              <p><strong>Buyer:</strong> {selectedQuote.buyer_name}</p>
              <p><strong>Price:</strong> ${selectedQuote.price}</p>
              <p><strong>MOQ:</strong> {selectedQuote.moq}</p>
              <p><strong>Lead Time:</strong> {selectedQuote.lead_time}</p>
              <p><strong>Notes:</strong> {selectedQuote.notes}</p>
              <p><strong>Created At:</strong> {dayjs(selectedQuote.created_at).format("YYYY-MM-DD")}</p>
            </div>
          )}
        </Modal>

        {/* Chat Modal */}
        <Modal
          title={`Chat with ${selectedQuote?.buyer_name || ""}`}
          open={chatModalVisible}
          onCancel={() => setChatModalVisible(false)}
          footer={null}
          width={500}
        >
          {selectedQuote && (
            <div className="flex flex-col h-[60vh] justify-between">
              <div className="overflow-y-auto mb-2 flex flex-col gap-2">
                {(selectedQuote.replies || []).map((r, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-md break-words ${
                      r.sender === "supplier" ? "self-end bg-blue-100 text-blue-900" : "self-start bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{r.message}</p>
                    <p className="text-xs text-right opacity-70">
                      {dayjs(r.created_at).format("YYYY-MM-DD HH:mm")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input.TextArea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  style={{ ...buttonStyle, height: 40 }}
                  onClick={handleSendReply}
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}
