import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import RolesTable from "../rbac/RolesTable";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";

export default function RolesPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Review and update role names, descriptions, and assigned access."
        actions={
          <ActionButton
            onClick={() => navigate(`/${ROLE_SLUG[role]}/roles/new`)}
          >
            New role
          </ActionButton>
        }
      />
      <RolesTable />
    </div>
  );
}
