import  { useState } from "react";
import {
  Card,
  Button,
  Input,
  List,
  Typography,
  message,
  Tag,
  Modal,
} from "antd";
import {
  UserOutlined,
  SendOutlined,
  BellOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const [requestText, setRequestText] = useState("");
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [activeVideo, setActiveVideo] = useState("");

  const notifications = [
    { id: 1, text: "Profile reviewed by Admin", unread: true },
    { id: 2, text: "New training material uploaded", unread: true },
    { id: 3, text: "Your last request was approved", unread: false },
  ];

  // ✔ Add link fields to videos / PDFs
  const trainingMaterials = [
    {
      id: 1,
      title: "System User Manual",
      type: "PDF",
      link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      id: 2,
      title: "How to Submit Requests",
      type: "Video",
      link: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      id: 3,
      title: "Beginner Training Guide",
      type: "PDF",
      link: "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
    },
  ];

  const handleSendRequest = () => {
    if (!requestText.trim()) {
      message.error("Please type your request first.");
      return;
    }
    message.success("Request sent successfully!");
    setRequestText("");
  };

  const handleTrainingClick = (item: any) => {
    if (item.type === "PDF") {
      window.open(item.link, "_blank"); // open PDF in new tab
    } else if (item.type === "Video") {
      setActiveVideo(item.link);
      setVideoModalVisible(true);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div
        className="rounded-xl p-6 text-white"
        style={{
          background: "#0F3952",
          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <UserOutlined />
          </div>

          <div>
            <Title level={3} style={{ color: "white", margin: 0 }}>Student Dashboard</Title>
            <Text style={{ color: "#d9f0ff" }}>
              Manage training, requests & communication
            </Text>
          </div>
        </div>
      </div>

      {/* REQUEST FORM */}
      <Card title="Ask Admin / Super Admin" style={{ borderRadius: 12 }}>
        <Text type="secondary">
          If you need support or have a question, write it below.
        </Text>

        <Input.TextArea
          rows={4}
          value={requestText}
          placeholder="Write your request..."
          onChange={(e) => setRequestText(e.target.value)}
          style={{ marginTop: 10, borderRadius: 10 }}
        />

        <div className="flex justify-end mt-3">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendRequest}
            style={{
              background: "#0F3952",
              borderColor: "#0F3952",
              padding: "5px 25px",
              borderRadius: "8px",
            }}
          >
            Send
          </Button>
        </div>
      </Card>

      {/* NOTIFICATIONS */}
      <Card
        title={<span><BellOutlined /> Notifications</span>}
        style={{ borderRadius: 12 }}
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item>
              <div className="flex justify-between w-full items-center">
                <Text>{item.text}</Text>
                {item.unread && <Tag color="blue">New</Tag>}
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* TRAINING MATERIALS */}
      <Card
        title={<span><FileTextOutlined /> Training Materials</span>}
        style={{ borderRadius: 12 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainingMaterials.map((item) => (
            <Card
              key={item.id}
              hoverable
              onClick={() => handleTrainingClick(item)}
              style={{
                borderRadius: 12,
                textAlign: "center",
                padding: 12,
                cursor: "pointer",
              }}
            >
              <div className="text-4xl mb-3" style={{ color: "#0F3952" }}>
                {item.type === "Video" ? <PlayCircleOutlined /> : <FileTextOutlined />}
              </div>

              <Title level={5}>{item.title}</Title>
              <Tag color="geekblue">{item.type}</Tag>
            </Card>
          ))}
        </div>
      </Card>

      {/* VIDEO PLAYER MODAL */}
      <Modal
        open={videoModalVisible}
        footer={null}
        width={720}
        onCancel={() => setVideoModalVisible(false)}
      >
        <video
          width="100%"
          controls
          style={{ borderRadius: 10 }}
          src={activeVideo}
        />
      </Modal>

    </div>
  );
}
