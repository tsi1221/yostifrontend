// src/pages/superAdmin/Settings.tsx
import  { useState } from "react";
import {
  Form,
  Input,
  Button,
  Switch,
  Card,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface FormValues {
  platformName: string;
  adminEmail: string;
  enableNotifications: boolean;
  maintenanceMode: boolean;
  logo?: UploadFile[];
  themeColor?: string;
  newPassword?: string;
  confirmPassword?: string;
  apiKey?: string;
  enableIntegration?: boolean;
}

export default function Settings() {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const saveSettings = async (values: FormValues) => {
    setLoading(true);

    // Optional: validate passwords match
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      message.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      console.log("Saved settings:", values);
      message.success("Settings updated successfully!");
    } catch (err) {
      message.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#0F3952",
          marginBottom: 24,
        }}
      >
        Superadmin Settings
      </h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={saveSettings}
        initialValues={{
          platformName: "Yosti Platform",
          adminEmail: "superadmin@yosti.com",
          enableNotifications: true,
          maintenanceMode: false,
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Platform Info */}
          <Col xs={24} md={12}>
            <Card title="Platform Info" bordered>
              <Form.Item
                name="platformName"
                label="Platform Name"
                rules={[{ required: true, message: "Please enter platform name" }]}
              >
                <Input placeholder="Enter platform name" />
              </Form.Item>

              <Form.Item
                name="adminEmail"
                label="Admin Contact Email"
                rules={[
                  { required: true, type: "email", message: "Enter a valid email" },
                ]}
              >
                <Input placeholder="Enter admin email" />
              </Form.Item>
            </Card>
          </Col>

          {/* Preferences */}
          <Col xs={24} md={12}>
            <Card title="Preferences" bordered>
              <Form.Item
                name="enableNotifications"
                label="Enable Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="maintenanceMode"
                label="Maintenance Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          {/* Appearance */}
          <Col xs={24} md={12}>
            <Card title="Platform Appearance" bordered>
              <Form.Item name="logo" label="Platform Logo" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
                <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                  <Button icon={<UploadOutlined />}>Upload Logo</Button>
                </Upload>
              </Form.Item>

              <Form.Item name="themeColor" label="Theme Color">
                <Input type="color" />
              </Form.Item>
            </Card>
          </Col>

          {/* Security */}
          <Col xs={24} md={12}>
            <Card title="Security Settings" bordered>
              <Form.Item name="newPassword" label="Change Password">
                <Input.Password placeholder="Enter new password" />
              </Form.Item>

              <Form.Item name="confirmPassword" label="Confirm Password">
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </Card>
          </Col>

          {/* API / Integrations */}
          <Col xs={24} md={12}>
            <Card title="API / Integrations" bordered>
              <Form.Item name="apiKey" label="API Key">
                <Input placeholder="Enter API key" />
              </Form.Item>

              <Form.Item
                name="enableIntegration"
                label="Enable Third-party Integrations"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          {/* Audit & Logs */}
          <Col xs={24} md={12}>
            <Card title="Audit & Logs" bordered>
              <Form.Item label="Last Login">
                <Input value="2025-11-28 02:30 AM" readOnly />
              </Form.Item>

              <Form.Item label="System Logs">
                <Input.TextArea rows={4} value="No critical logs yet" readOnly />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ background: "#0F3952", border: "none" }}
          >
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
