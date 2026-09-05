import ActionButton from "../components/ActionButton";
import DataTable, { type DataTableColumn } from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { findUserName, useDashboard, useScopedRecords } from "../store";
import type { SupportRequest } from "../types";

export default function SupportPage() {
  const { snapshot, role, actions } = useDashboard();
  const { support } = useScopedRecords();
  const staff = role === "SUPER_ADMIN" || role === "STAFF";

  const columns: DataTableColumn<SupportRequest>[] = [
    { header: "Ticket", render: (row) => row.support_id },
    { header: "Order", render: (row) => row.order_reference },
    { header: "Issue", render: (row) => row.issue_type },
    {
      header: "Urgency",
      render: (row) => <StatusBadge value={row.urgency} />,
    },
  ];

  if (staff) {
    columns.push({
      header: "Requester",
      render: (row) => findUserName(snapshot, row.user_id),
    });
  }

  columns.push(
    { header: "Notes", render: (row) => row.notes },
    {
      header: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    }
  );

  if (staff) {
    columns.push({
      header: "Actions",
      render: (row) =>
        row.status === "closed" ? (
          <span className="text-xs text-slate-400">Closed</span>
        ) : (
          <div className="flex gap-2">
            <ActionButton
              tone="ghost"
              onClick={() => actions.closeSupport(row.support_id, "resolved")}
            >
              Resolve
            </ActionButton>
            <ActionButton
              onClick={() => actions.closeSupport(row.support_id, "closed")}
            >
              Close
            </ActionButton>
          </div>
        ),
    });
  }

  return (
    <div>
      <PageHeader
        title={staff ? "Client support tickets" : "Support requests"}
        description={
          staff
            ? "Close or resolve buyer issues against order references."
            : "Defect, damage, and missing-item tickets tied to your orders."
        }
      />
      <DataTable<SupportRequest>
        rows={support}
        rowKey={(row) => row.support_id}
        empty="No support requests."
        columns={columns}
      />
    </div>
  );
}
