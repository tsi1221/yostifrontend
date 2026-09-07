// src/pages/Blogs.tsx
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Tag,
  Switch,
  Space,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";

interface BlogPost {
  post_id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
}

interface Testimonial {
  testimonial_id: string;
  user_id: string;
  review_text: string;
  rating: number;
  video_url?: string;
  isApproved: boolean;
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<"blogs" | "testimonials">("blogs");

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(
    null
  );

  const [form] = Form.useForm();

  const tabButtonStyle = (active: boolean) => ({
    padding: "10px 26px",
    borderRadius: 6,
    border: "1px solid #0F3952",
    background: active ? "#0F3952" : "#fff",
    fontWeight: 600,
    color: active ? "#FFD700" : "#0F3952",
    cursor: "pointer",
    transition: "0.2s",
  });

  useEffect(() => {
    setBlogs([
      {
        post_id: "1",
        title: "How to Source Products",
        content: "This guide explains sourcing techniques...",
        category: "Sourcing Tips",
        author_id: "user_1",
      },
      {
        post_id: "2",
        title: "Shipping From China",
        content: "Everything about logistics and shipping...",
        category: "Shipping Guide",
        author_id: "user_2",
      },
    ]);

    setTestimonials([
      {
        testimonial_id: "101",
        user_id: "user_3",
        review_text: "Great platform! I found reliable suppliers.",
        rating: 5,
        video_url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        isApproved: true,
      },
      {
        testimonial_id: "102",
        user_id: "user_4",
        review_text: "Fast shipping and great support.",
        rating: 4,
        video_url: "",
        isApproved: false,
      },
      {
        testimonial_id: "103",
        user_id: "user_5",
        review_text: "Amazing experience, recommended!",
        rating: 5,
        video_url: "",
        isApproved: true,
      },
    ]);
  }, []);

  // ---------- FIXED openDrawer ----------
  const openDrawer = (
    type: "blog" | "testimonial",
    record?: BlogPost | Testimonial | null,
    view: boolean = false
  ) => {
    setViewMode(view);

    if (type === "blog") {
      setEditingBlog((record as BlogPost) || null);
      setEditingTestimonial(null);
    } else {
      setEditingTestimonial((record as Testimonial) || null);
      setEditingBlog(null);
    }

    form.setFieldsValue(record || {});
    setDrawerVisible(true);
  };

  const saveChanges = () => {
    const values = form.getFieldsValue();

    if (editingBlog) {
      if (editingBlog.post_id) {
        setBlogs(prev =>
          prev.map(b => (b.post_id === editingBlog.post_id ? { ...b, ...values } : b))
        );
      } else {
        setBlogs(prev => [
          ...prev,
          {
            ...values,
            post_id: String(Date.now()),
          },
        ]);
      }
    }

    if (editingTestimonial) {
      if (editingTestimonial.testimonial_id) {
        setTestimonials(prev =>
          prev.map(t =>
            t.testimonial_id === editingTestimonial.testimonial_id
              ? { ...t, ...values }
              : t
          )
        );
      } else {
        setTestimonials(prev => [
          ...prev,
          {
            ...values,
            testimonial_id: String(Date.now()),
            isApproved: values.isApproved ?? false,
          },
        ]);
      }
    }

    setDrawerVisible(false);
    form.resetFields();
    setEditingBlog(null);
    setEditingTestimonial(null);
  };

  const handleDelete = (type: "blog" | "testimonial", id: string) => {
    if (type === "blog") setBlogs(prev => prev.filter(p => p.post_id !== id));
    else setTestimonials(prev => prev.filter(p => p.testimonial_id !== id));
  };

  const blogColumns = [
    { title: "Title", dataIndex: "title" },
    { title: "Category", dataIndex: "category" },
    { title: "Author", dataIndex: "author_id" },
    {
      title: "Action",
      render: (_:       unknown      , record: BlogPost) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDrawer("blog", record, true)}
          />
          <Button icon={<EditOutlined />} onClick={() => openDrawer("blog", record)} />
          <Button danger onClick={() => handleDelete("blog", record.post_id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const testimonialColumns = [
    { title: "User ID", dataIndex: "user_id" },
    { title: "Review", dataIndex: "review_text" },
    { title: "Rating", dataIndex: "rating" },
    {
      title: "Approved",
      dataIndex: "isApproved",
      render: (v: boolean) => (v ? <Tag color="green">Yes</Tag> : <Tag color="orange">Pending</Tag>),
    },
    {
      title: "Action",
      render: (_:   unknown   , record: Testimonial) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openDrawer("testimonial", record, true)}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => openDrawer("testimonial", record)}
          />
          <Button danger onClick={() => handleDelete("testimonial", record.testimonial_id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const submitButtonLabel =
    editingBlog && editingBlog.post_id
      ? "Update"
      : editingBlog
      ? "Post"
      : editingTestimonial && editingTestimonial.testimonial_id
      ? "Update"
      : "Submit";

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ fontSize: 24, color: "#0F3952", fontWeight: 700, marginBottom: 24 }}>
        Blogs & Testimonials Management
      </h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <button style={tabButtonStyle(activeTab === "blogs")} onClick={() => setActiveTab("blogs")}>
          Blog Posts
        </button>
        <button
          style={tabButtonStyle(activeTab === "testimonials")}
          onClick={() => setActiveTab("testimonials")}
        >
          Testimonials
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        {activeTab === "blogs" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#0F3952" }}
            onClick={() => openDrawer("blog")}
          >
            Add Blog
          </Button>
        )}

        {activeTab === "testimonials" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#0F3952" }}
            onClick={() => openDrawer("testimonial")}
          >
            Add Testimony
          </Button>
        )}
      </div>

      {activeTab === "blogs" && (
        <Table
          rowKey="post_id"
          dataSource={blogs}
          columns={blogColumns}
          bordered
          pagination={{ pageSize: 6, position: ["bottomRight"] }}
        />
      )}

      {activeTab === "testimonials" && (
        <Table
          rowKey="testimonial_id"
          dataSource={testimonials}
          columns={testimonialColumns}
          bordered
          pagination={{ pageSize: 6, position: ["bottomRight"] }}
        />
      )}

      <Drawer
        open={drawerVisible}
        width={420}
        onClose={() => setDrawerVisible(false)}
        title={viewMode ? "View Details" : "Fill Details"}
        footer={
          !viewMode && (
            <Space style={{ justifyContent: "flex-end", width: "100%" }}>
              <Button icon={<CloseOutlined />} onClick={() => setDrawerVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                style={{ background: "#0F3952" }}
                onClick={saveChanges}
              >
                {submitButtonLabel}
              </Button>
            </Space>
          )
        }
      >
        <Form layout="vertical" form={form}>
          {editingBlog && (
            <>
              <Form.Item name="title" label="Title">
                <Input disabled={viewMode} />
              </Form.Item>
              <Form.Item name="category" label="Category">
                <Input disabled={viewMode} />
              </Form.Item>
              <Form.Item name="content" label="Content">
                <Input.TextArea rows={6} disabled={viewMode} />
              </Form.Item>
              <Form.Item name="author_id" label="Author ID">
                <Input disabled={viewMode} />
              </Form.Item>
            </>
          )}

          {editingTestimonial && (
            <>
              <Form.Item name="user_id" label="User ID">
                <Input disabled={viewMode} />
              </Form.Item>
              <Form.Item name="review_text" label="Review">
                <Input.TextArea rows={4} disabled={viewMode} />
              </Form.Item>
              <Form.Item name="rating" label="Rating">
                <Input type="number" min={1} max={5} disabled={viewMode} />
              </Form.Item>

              {editingTestimonial.video_url && viewMode && (
                <video controls style={{ width: "100%", borderRadius: 8 }}>
                  <source src={editingTestimonial.video_url} />
                </video>
              )}

              <Form.Item name="video_url" label="Video URL">
                <Input disabled={viewMode} />
              </Form.Item>

              <Form.Item name="isApproved" label="Approved" valuePropName="checked">
                <Switch disabled={viewMode} />
              </Form.Item>
            </>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default Blogs;
