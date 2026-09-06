import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import RoleConfiguratorForm from "./RoleConfiguratorForm";
import type { RoleFormValues } from "./types";
import { EMPTY_ROLE_FORM } from "./types";
import { useCreateRole } from "./useCreateRole";

export default function CreateRoleForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/roles`;
  const { submitRole, saving, conflict, authError, fieldErrors } = useCreateRole();
  const [values, setValues] = useState<RoleFormValues>(EMPTY_ROLE_FORM);

  return (
    <div>
      <PageHeader
        title="Create role"
        description="Name the role, describe it, and assign permission IDs."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to roles
          </ActionButton>
        }
      />
      <RoleConfiguratorForm
        mode="create"
        values={values}
        saving={saving}
        fieldErrors={fieldErrors}
        conflict={conflict}
        authError={authError}
        submitLabel="Create role"
        submittingLabel="Creating Role..."
        onChange={setValues}
        onCancel={() => navigate(listPath)}
        onSubmit={async () => {
          const created = await submitRole(values);
          if (created) {
            setValues(EMPTY_ROLE_FORM);
            navigate(listPath, { replace: true });
          }
        }}
      />
    </div>
  );
}
