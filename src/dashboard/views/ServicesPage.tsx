import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { dashboardSnapshot } from "../data";
import type { TradeService } from "../types";

export default function ServicesPage() {
  return (
    <div>
      <PageHeader title="Trade services" description="Catalog of billable Yosti services." />
      <DataTable<TradeService>
        rows={dashboardSnapshot.services}
        rowKey={(row) => row.id}
        empty="No services configured."
        columns={[
          { header: "Service", render: (row) => row.name },
          { header: "Description", render: (row) => row.description },
          { header: "Fee", render: (row) => `USD ${row.feeUsd}` },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.active ? "ACTIVE" : "INACTIVE"} />,
          },
        ]}
      />
    </div>
  );
}
