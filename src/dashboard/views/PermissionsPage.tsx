import PageHeader from "../components/PageHeader";
import PermissionsTable from "../permissions/PermissionsTable";

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Read-only master list of system permissions. Use this catalog as lookup data when assigning permission IDs to a role."
      />
      <PermissionsTable />
    </div>
  );
}
