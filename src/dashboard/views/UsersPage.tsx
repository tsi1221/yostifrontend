import PageHeader from "../components/PageHeader";
import UsersTable from "../users/UsersTable";

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="User Account Management"
        description="Search and filter registered accounts."
      />
      <UsersTable />
    </div>
  );
}
