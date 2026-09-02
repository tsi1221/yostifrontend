// src/pages/superAdmin/Blog.tsx
import  { useState } from "react";
import { Table, Modal, Form, Input, Button, Select, Space, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

interface BlogPost {
  id: string;
  title: string;
  category: string;
  content: string;
  authorId: string;
}

export default function AllBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: "B001",
      title: "Yosti Expands to Yiwu",
      category: "Business",
      content: "We successfully helped Ethiopian buyers source high-quality machinery...",
      authorId: "ADM001",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [form] = Form.useForm();

  const openAddModal = () => {
    setSelected(null);
    form.resetFields();
    setModalOpen(true);
  };

  const editPost = (record: BlogPost) => {
    setSelected(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const savePost = () => {
    form.validateFields().then(values => {
      if (selected) {
        setPosts(prev => prev.map(p => (p.id === selected.id ? { ...p, ...values } : p)));
        message.success("Blog updated successfully");
      } else {
        const newEntry: BlogPost = {
          id: `B${String(posts.length + 1).padStart(3, "0")}`,
          ...values,
        };
        setPosts(prev => [newEntry, ...prev]);
        message.success("New blog added");
      }
      setModalOpen(false);
      form.resetFields();
    }).catch(() => {});
  };

  const deletePost = (record: BlogPost) => {
    Modal.confirm({
      title: "Delete Blog?",
      content: `Are you sure you want to delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        setPosts(prev => prev.filter(p => p.id !== record.id));
        message.success("Blog deleted");
      },
    });
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Category", dataIndex: "category", key: "category" },
    { 
      title: "Content", 
      dataIndex: "content", 
      key: "content", 
      render: (text: string) => (
        <div style={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {text}
        </div>
      )
    },
    { title: "Author ID", dataIndex: "authorId", key: "authorId" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BlogPost) => (
        <Space>
          <Button icon={<EditOutlined />} style={{ color: "#0F3952" }} onClick={() => editPost(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => deletePost(record)}>Delete</Button>
        </Space>
      )
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F3952", marginBottom: 16 }}>Manage Blog & News</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} style={{ background: "#0F3952", marginBottom: 16 }}>
          Add Blog
        </Button>
      </div>

      <Table
        bordered
        rowKey="id"
        columns={columns}
        dataSource={posts}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 800 }}
      />

      <Modal
        title={selected ? "Edit Blog" : "Add Blog"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={savePost}
        okText="Save"
      >
        <Form layout="vertical" form={form} initialValues={selected || { title: "", category: "", content: "", authorId: "" }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter blog title" />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              <Option value="Business">Business</Option>
              <Option value="News">News</Option>
              <Option value="Tech">Tech</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Enter blog content" />
          </Form.Item>

          <Form.Item name="authorId" label="Author ID" rules={[{ required: true }]}>
            <Input placeholder="Enter author ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
