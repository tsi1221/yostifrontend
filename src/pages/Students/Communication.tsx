// src/pages/student/Communication.tsx
import  { useState, useRef, useEffect } from "react";
import { Input, Button, List } from "antd";
import { SendOutlined, TeamOutlined } from "@ant-design/icons";

interface Message {
  id: number;
  sender: "student" | "admin";
  content: string;
  timestamp: string;
}

export default function Communication() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "admin", content: "Welcome! Ask your questions here.", timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = { id: messages.length + 1, sender: "student", content: input, timestamp: new Date().toISOString() };
    setMessages([...messages, newMsg]);
    setInput("");

    // Simulate admin response
    setTimeout(() => {
      const adminReply: Message = {
        id: messages.length + 2,
        sender: "admin",
        content: "Thanks! We’ll get back to you shortly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, adminReply]);
    }, 1200);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="p-6" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16, fontSize: 18 }}>
        <TeamOutlined style={{ marginRight: 8 }} /> Communicate with Staff/Admin
      </div>

      <div style={{
        height: "360px",
        overflowY: "auto",
        padding: 12,
        border: "1px solid #e0e0e0",
        borderRadius: 12,
        background: "#f5f5f5",
        marginBottom: 12
      }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{ justifyContent: msg.sender === "student" ? "flex-end" : "flex-start", border: "none", padding: 0 }}>
              <div style={{
                background: msg.sender === "student" ? "#0F3952" : "#ffffff",
                color: msg.sender === "student" ? "#fff" : "#000",
                padding: "10px 16px",
                borderRadius: 20,
                maxWidth: "95%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                position: "relative",
                wordBreak: "break-word",
                marginBottom: 8
              }}>
                {msg.content}
                <div style={{
                  fontSize: 10,
                  opacity: 0.6,
                  marginTop: 4,
                  textAlign: "right"
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 4 }}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          style={{
            borderRadius: 20,
            padding: "10px 16px",
            resize: "none",
            background: "#fff",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          style={{ backgroundColor: "#0F3952", borderColor: "#0F3952", borderRadius: 20 }}
        />
      </div>
    </div>
  );
}
