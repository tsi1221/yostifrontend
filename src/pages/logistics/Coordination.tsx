// src/pages/logistics/Coordination.tsx
import { useEffect, useState } from "react";
import { Card, Table, Tag, Spin } from "antd";

interface Container {
  id: string;
  shipmentId: string;
  status: string;
  location: string;
  estArrival: string;
}

// Mock fetch function simulating Yosti API
const fetchContainerData = (): Promise<Container[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: "CNT-001", shipmentId: "SHP-001", status: "Loaded", location: "Port Addis", estArrival: "2025-12-05" },
          { id: "CNT-002", shipmentId: "SHP-002", status: "In Transit", location: "En route Djibouti", estArrival: "2025-12-07" },
        ]),
      1000
    )
  );

export default function Coordination() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContainerData().then((data) => {
      setContainers(data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { title: "Container ID", dataIndex: "id", key: "id" },
    { title: "Shipment ID", dataIndex: "shipmentId", key: "shipmentId" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "Loaded" ? "blue" : status === "In Transit" ? "orange" : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Current Location", dataIndex: "location", key: "location" },
    { title: "Est. Arrival", dataIndex: "estArrival", key: "estArrival" },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <h1 style={{ marginBottom: 16 }}>Coordination with Yosti</h1>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Card>
          <Table dataSource={containers} columns={columns} rowKey="id" pagination={false} />
        </Card>
      )}
    </div>
  );
}
