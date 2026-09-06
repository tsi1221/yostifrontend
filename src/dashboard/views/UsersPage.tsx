import GrantSuperAdminButton from "../components/GrantSuperAdminButton";
import PageHeader from "../components/PageHeader";
import UsersTable from "../users/UsersTable";

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="User Account Management"
        description="Search, filter, and page through live accounts from the Yosti users API."
        actions={<GrantSuperAdminButton />}
      />
      <UsersTable />
    </div>
  );
}
