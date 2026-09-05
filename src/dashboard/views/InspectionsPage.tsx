import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { getInspections, getSessionUser } from "../data";
import type { Inspection, UserRole } from "../types";

export default function InspectionsPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getInspections(role, user.id);

  return (
    <div>
      <PageHeader title="Quality control" description="Inspection jobs from the mock schema." />
      <DataTable<Inspection>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No inspections visible."
        columns={[
          { header: "Job", render: (row) => row.requestNumber },
          { header: "Product", render: (row) => row.productName },
          { header: "Location", render: (row) => row.location },
          { header: "Inspector", render: (row) => row.inspectorName },
          { header: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
