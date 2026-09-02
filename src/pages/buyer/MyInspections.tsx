import React, { useState } from "react";
import { Button, Card, Spin, Form, Input, DatePicker, Checkbox, Select } from "antd";
import dayjs from "dayjs";
import { useInspection, type InspectionStatus } from "../../hooks/useInspectionsBuyer";

const { Option } = Select;

/* ========= TYPE FOR FORM VALUES ========= */
interface InspectionFormValues {
  productType: string;
  inspectionType: "pre-shipment" | "post-shipment";
  inspectionDate: dayjs.Dayjs;
  photoVideoRequired: boolean;
}

const MyInspections: React.FC = () => {
  const { inspection, loading, fetchInspection, createInspection } = useInspection();
  const [inspectionId, setInspectionId] = useState("");
  const [form] = Form.useForm<InspectionFormValues>();

  /* ========= HANDLE FETCH BY ID ========= */
  const handleFetch = () => {
    if (!inspectionId) return;
    fetchInspection(inspectionId);
  };

  /* ========= HANDLE CREATE NEW ========= */
  const handleCreate = (values: InspectionFormValues) => {
    const payload = {
      productType: values.productType,
      inspectionType: values.inspectionType,
      inspectionDate: values.inspectionDate.format("YYYY-MM-DD"),
      photoVideoRequired: values.photoVideoRequired,
    };

    createInspection(payload);
    form.resetFields();
  };

  return (
    <div className="my-inspections">
      <h2>My Inspection Requests</h2>

      <Card style={{ marginBottom: 20 }}>
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item
            label="Product Type"
            name="productType"
            rules={[{ required: true, message: "Please enter product type" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Inspection Type"
            name="inspectionType"
            rules={[{ required: true, message: "Please select inspection type" }]}
          >
            <Select>
              <Option value="pre-shipment">Pre-shipment</Option>
              <Option value="post-shipment">Post-shipment</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Inspection Date"
            name="inspectionDate"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item name="photoVideoRequired" valuePropName="checked">
            <Checkbox>Photo/Video Required</Checkbox>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Submit Inspection
          </Button>
        </Form>
      </Card>

      <Card>
        <h3>Fetch Inspection by ID</h3>
        <Input
          placeholder="Enter Inspection ID"
          value={inspectionId}
          onChange={(e) => setInspectionId(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Button onClick={handleFetch} loading={loading}>
          Fetch Inspection
        </Button>

        {loading && <Spin style={{ marginTop: 10 }} />}
        {inspection && (
          <Card title={`Inspection: ${inspection._id}`} style={{ marginTop: 20 }}>
            <p><strong>Product:</strong> {inspection.productType}</p>
            <p><strong>Type:</strong> {inspection.inspectionType}</p>
            <p><strong>Date:</strong> {dayjs(inspection.inspectionDate).format("YYYY-MM-DD")}</p>
            <p><strong>Status:</strong> {inspection.status as InspectionStatus}</p>
            <p><strong>Remarks:</strong> {inspection.remarks || "N/A"}</p>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default MyInspections;
