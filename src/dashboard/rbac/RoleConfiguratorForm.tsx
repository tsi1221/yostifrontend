import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, TextArea, TextInput } from "../components/FormField";
import PermissionPicker from "./PermissionPicker";
import type { RoleConfiguratorMode, RoleFieldErrors, RoleFormValues, RolePermission } from "./types";
import { usePermissionsCatalog } from "./usePermissionsCatalog";

interface RoleConfiguratorFormProps {
  mode: RoleConfiguratorMode;
  values: RoleFormValues;
  saving: boolean;
  fieldErrors: RoleFieldErrors;
  conflict?: string | null;
  authError?: string | null;
  notFound?: string | null;
  extras?: RolePermission[];
  submitLabel: string;
  submittingLabel: string;
  onChange: (values: RoleFormValues) => void;
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;
}

export default function RoleConfiguratorForm({
  mode,
  values,
  saving,
  fieldErrors,
  conflict,
  authError,
  notFound,
  extras = [],
  submitLabel,
  submittingLabel,
  onChange,
  onSubmit,
  onCancel,
}: RoleConfiguratorFormProps) {
  const { permissions, loading } = usePermissionsCatalog(extras, values.permissionIds);
  const [hydrated, setHydrated] = useState(values);

  useEffect(() => {
    setHydrated(values);
  }, [values]);

  const setField = <K extends keyof RoleFormValues>(key: K, value: RoleFormValues[K]) => {
    const next = { ...hydrated, [key]: value };
    setHydrated(next);
    onChange(next);
  };

  return (
    <form
      className={mode === "create" ? "space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" : "space-y-4"}
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit();
      }}
    >
      {conflict ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {conflict}
        </div>
      ) : null}

      {notFound ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {notFound}
        </div>
      ) : null}

      {authError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>{authError}</p>
          <ActionButton type="submit" disabled={saving}>
            Retry
          </ActionButton>
        </div>
      ) : null}

      <fieldset disabled={saving} className="space-y-4">
        <Field label="Role name" error={fieldErrors.name}>
          <TextInput
            placeholder="Operations lead"
            value={hydrated.name}
            onChange={(event) => setField("name", event.target.value)}
          />
        </Field>
        <Field label="Description" error={fieldErrors.description}>
          <TextArea
            placeholder="What this role can do across the admin workspace"
            value={hydrated.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </Field>
        <PermissionPicker
          permissions={permissions}
          selectedIds={hydrated.permissionIds}
          loading={loading}
          error={fieldErrors.permissionIds}
          disabled={saving}
          onChange={(permissionIds) => setField("permissionIds", permissionIds)}
        />
      </fieldset>

      <div className={`flex gap-2 ${mode === "create" ? "justify-end" : "pt-2"}`}>
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className={mode === "edit" ? "flex-1" : ""} disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {submittingLabel}
            </span>
          ) : (
            submitLabel
          )}
        </ActionButton>
      </div>
    </form>
  );
}
