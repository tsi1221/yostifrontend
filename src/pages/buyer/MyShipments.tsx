import  { useState } from "react";
import useShipments, { type Shipment, type CreateShipmentInput } from "../../hooks/useShipmentBuyer";
import { Modal, Button, Form, Input, Select, message, Spin } from "antd";

const { Option } = Select;

const statusColors: Record<string, string> = {
  booked: "bg-blue-100 text-blue-800",
  "at-port": "bg-yellow-100 text-yellow-800",
  "in-transit": "bg-purple-100 text-purple-800",
  customs: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const MyShipments: React.FC = () => {
  const { shipments, loading, createShipment, getShipmentById } = useShipments();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleViewDetails = async (id: string) => {
    try {
      const shipment = await getShipmentById(id);
      setSelectedShipment(shipment);
    } catch (error) {
      console.error("Failed to fetch shipment details", error);
      message.error("Failed to fetch shipment details");
    }
  };

  const handleCreate = async () => {
    try {
      const values: CreateShipmentInput = await form.validateFields();
      await createShipment(values);
      message.success("Shipment created successfully");
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to create shipment", error);
      message.error("Failed to create shipment");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Shipments</h1>
      <Button type="primary" className="mb-4" onClick={() => setModalVisible(true)}>
        Create Shipment
      </Button>

      {loading ? (
        <Spin />
      ) : shipments.length === 0 ? (
        <p>No shipments found.</p>
      ) : (
        <table className="min-w-full border border-gray-200 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th>Tracking #</th>
              <th>Goods</th>
              <th>Route</th>
              <th>Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment._id} className="border-b">
                <td>{shipment.trackingNumber || "N/A"}</td>
                <td>{shipment.goodsDescription}</td>
                <td>{shipment.pickupLocation} → {shipment.destinationCity}, {shipment.destinationCountry}</td>
                <td className="capitalize">{shipment.shippingMethod}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusColors[shipment.status]}`}>
                    {shipment.status}
                  </span>
                </td>
                <td>
                  <Button type="link" onClick={() => handleViewDetails(shipment._id)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedShipment && (
        <Modal
          title="Shipment Details"
          visible={!!selectedShipment}
          onCancel={() => setSelectedShipment(null)}
          footer={null}
        >
          <p><strong>Tracking #:</strong> {selectedShipment.trackingNumber}</p>
          <p><strong>Goods:</strong> {selectedShipment.goodsDescription}</p>
          <p><strong>Route:</strong> {selectedShipment.pickupLocation} → {selectedShipment.destinationCity}, {selectedShipment.destinationCountry}</p>
          <p><strong>Method:</strong> {selectedShipment.shippingMethod}</p>
          <p><strong>Status:</strong> {selectedShipment.status}</p>

          {selectedShipment.updates?.length ? (
            <>
              <h3>Updates:</h3>
              <ul className="list-disc list-inside">
                {selectedShipment.updates.map((update) => (
                  <li key={update._id}>
                    {new Date(update.updateTime).toLocaleString()} — {update.location} ({update.status})
                    {update.remarks && `: ${update.remarks}`}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Modal>
      )}

      <Modal
        title="Create Shipment"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreate}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="pickupLocation" label="Pickup Location" rules={[{ required: true }]}>
            <Input placeholder="Guangzhou Warehouse" />
          </Form.Item>
          <Form.Item name="destinationCountry" label="Destination Country" rules={[{ required: true }]}>
            <Input placeholder="Ethiopia" />
          </Form.Item>
          <Form.Item name="destinationCity" label="Destination City" rules={[{ required: true }]}>
            <Input placeholder="Addis Ababa" />
          </Form.Item>
          <Form.Item name="goodsDescription" label="Goods Description" rules={[{ required: true }]}>
            <Input placeholder="1000 Cotton T-Shirts" />
          </Form.Item>
          <Form.Item name="weight" label="Weight (kg)" rules={[{ required: true }]}>
            <Input type="number" placeholder="1000" />
          </Form.Item>
          <Form.Item name="volume" label="Volume (m³)">
            <Input type="number" placeholder="50" />
          </Form.Item>
          <Form.Item name="shippingMethod" label="Shipping Method" rules={[{ required: true }]}>
            <Select placeholder="Select method">
              <Option value="air">Air</Option>
              <Option value="sea">Sea</Option>
              <Option value="express">Express</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyShipments;
