import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { findUserName, getSessionUser, getTrips } from "../data";
import type { Trip, UserRole } from "../types";

export default function TripsPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getTrips(role, user.id);

  return (
    <div>
      <PageHeader title="Business trips" description="Travel tied to sourcing and factory visits." />
      <DataTable<Trip>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No trips visible."
        columns={[
          { header: "Trip", render: (row) => row.title },
          { header: "Buyer", render: (row) => findUserName(row.buyerId) },
          { header: "Route", render: (row) => `${row.origin} → ${row.destination}` },
          { header: "Dates", render: (row) => `${row.startDate} – ${row.endDate}` },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
