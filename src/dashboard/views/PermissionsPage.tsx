import PageHeader from "../components/PageHeader";
import PermissionsTable from "../permissions/PermissionsTable";

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Browse the access catalog used when configuring roles."
      />
      <PermissionsTable />
    </div>
  );
}
