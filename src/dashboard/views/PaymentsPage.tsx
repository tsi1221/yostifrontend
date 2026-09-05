import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { findUserName, getPayments, getSessionUser } from "../data";
import type { Payment, UserRole } from "../types";

export default function PaymentsPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getPayments(role, user.id);

  return (
    <div>
      <PageHeader title="Payments" description="Trade payments scoped to this workspace." />
      <DataTable<Payment>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No payments visible."
        columns={[
          { header: "Reference", render: (row) => row.reference },
          { header: "Buyer", render: (row) => findUserName(row.buyerId) },
          { header: "Amount", render: (row) => `${row.currency} ${row.amount.toLocaleString()}` },
          { header: "Method", render: (row) => row.method.replace(/_/g, " ") },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
