import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { getSessionUser, getShipments } from "../data";
import type { Shipment, UserRole } from "../types";

export default function ShipmentsPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getShipments(role, user.id);

  return (
    <div>
      <PageHeader
        title="Cargo & tracking"
        description="Shipments scoped to the signed-in role."
      />
      <DataTable<Shipment>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No shipments visible."
        columns={[
          { header: "Tracking", render: (row) => row.trackingNumber },
          { header: "Cargo", render: (row) => row.title },
          { header: "Lane", render: (row) => `${row.origin} → ${row.destination}` },
          { header: "Mode", render: (row) => <StatusBadge value={row.mode} /> },
          { header: "ETA", render: (row) => row.eta },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
