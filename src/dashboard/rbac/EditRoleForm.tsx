import { useEffect, useState } from "react";

import { asRoleId, roleToFormValues } from "./api";
import RoleConfiguratorForm from "./RoleConfiguratorForm";
import type { RoleFormValues, RoleRecord } from "./types";
import { useUpdateRole } from "./useUpdateRole";

interface EditRoleFormProps {
  role: RoleRecord;
  onCancel: () => void;
  onSaved: (updated: RoleRecord) => void;
}

export default function EditRoleForm({ role, onCancel, onSaved }: EditRoleFormProps) {
  const roleId = asRoleId(role.id) ?? 0;
  const { updateRole, saving, notFound, authError, fieldErrors } = useUpdateRole(roleId);
  const [values, setValues] = useState<RoleFormValues>(() => roleToFormValues(role));

  useEffect(() => {
    setValues(roleToFormValues(role));
  }, [role]);

  return (
    <RoleConfiguratorForm
      mode="edit"
      values={values}
      saving={saving}
      fieldErrors={fieldErrors}
      authError={authError}
      notFound={notFound}
      extras={role.permissions}
      submitLabel="Save changes"
      submittingLabel="Updating Role..."
      onChange={setValues}
      onCancel={onCancel}
      onSubmit={async () => {
        const updated = await updateRole(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    />
  );
}
