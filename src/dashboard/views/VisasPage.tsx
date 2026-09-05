import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { getSessionUser, getVisas } from "../data";
import type { UserRole, VisaInvitation } from "../types";

export default function VisasPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getVisas(role, user.id);

  return (
    <div>
      <PageHeader title="Visa invitations" description="China business visa invitation letters." />
      <DataTable<VisaInvitation>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No visa invitations visible."
        columns={[
          { header: "Applicant", render: (row) => row.fullName },
          { header: "Passport", render: (row) => row.passportNo },
          { header: "Nationality", render: (row) => row.nationality },
          { header: "Purpose", render: (row) => row.purpose },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
