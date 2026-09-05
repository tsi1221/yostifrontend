import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { findUserName, getSessionUser, getUsers } from "../data";
import type { User, UserRole } from "../types";

export default function UsersPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getUsers(role);

  return (
    <div>
      <PageHeader
        title="Users"
        description={`Account records visible to ${findUserName(user.id)}.`}
      />
      <DataTable<User>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No users in this workspace."
        columns={[
          { header: "Name", render: (row) => row.fullName },
          { header: "Company", render: (row) => row.companyName },
          { header: "Email", render: (row) => row.email },
          { header: "Country", render: (row) => row.country },
          { header: "Role", render: (row) => <StatusBadge value={row.role} /> },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
