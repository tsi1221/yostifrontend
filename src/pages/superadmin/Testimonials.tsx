// src/pages/superAdmin/Testimonials.tsx
import { useState } from "react";
import { Table, Button, Modal, Form, Input, Rate, Select, Space, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Testimonial {
  id: string;
  name: string;
  country: string;
  review: string;
  rating: number;
  videoUrl?: string;
  approved: boolean;
}

// Initial mock data
const initialTestimonials: Testimonial[] = [
  {
    id: "T001",
    name: "Dawit G.",
    country: "Ethiopia",
    review: "Yosti helped me source high-quality machinery at a much better price than I expected.",
    rating: 5,
    videoUrl: "",
    approved: true,
  },
  {
    id: "T002",
    name: "Samuel K.",
    country: "South Sudan",
    review: "Thanks to Yosti’s business trip planning, I visited reliable suppliers and finalized deals quickly.",
    rating: 5,
    videoUrl: "",
    approved: false,
  },
];

export default function AllTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [form] = Form.useForm();

  const openAddModal = () => {
    setSelected(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: Testimonial) => {
    setSelected(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const saveTestimonial = () => {
    form
      .validateFields()
      .then((values) => {
        if (selected) {
          setTestimonials((prev) =>
            prev.map((t) => (t.id === selected.id ? { ...t, ...values } : t))
          );
          message.success("Testimonial updated successfully!");
        } else {
          const newTestimonial: Testimonial = {
            id: `T${String(testimonials.length + 1).padStart(3, "0")}`,
            ...values,
          };
          setTestimonials((prev) => [...prev, newTestimonial]);
          message.success("Testimonial added successfully!");
        }
        setModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  const deleteTestimonial = (record: Testimonial) => {
    Modal.confirm({
      title: "Delete Testimonial",
      content: `Are you sure you want to delete ${record.name}'s testimonial?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        setTestimonials((prev) => prev.filter((t) => t.id !== record.id));
        message.success("Deleted successfully");
      },
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Country", dataIndex: "country", key: "country" },
    { title: "Review", dataIndex: "review", key: "review" },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: "Video URL",
      dataIndex: "videoUrl",
      key: "videoUrl",
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            View Video
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Approved",
      dataIndex: "approved",
      key: "approved",
      render: (approved: boolean) => (
        <Tag color={approved ? "green" : "orange"}>{approved ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Testimonial) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => deleteTestimonial(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F3952" }}>Manage Testimonials</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background: "#0F3952" }}>
          Add Testimonial
        </Button>
      </div>

      <Table
        bordered
        rowKey="id"
        dataSource={testimonials}
        columns={columns}
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />

      {/* Add/Edit Modal */}
      <Modal
        title={selected ? "Edit Testimonial" : "Add Testimonial"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={saveTestimonial}
        okText="Save"
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item name="country" label="Country" rules={[{ required: true }]}>
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item name="review" label="Review" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Write review" rows={3} />
          </Form.Item>

          <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>

          <Form.Item name="videoUrl" label="Video URL">
            <Input placeholder="Optional video link" />
          </Form.Item>

          <Form.Item name="approved" label="Approved" valuePropName="checked">
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
