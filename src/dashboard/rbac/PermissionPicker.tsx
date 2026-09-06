import { useMemo, useState } from "react";

import ActionButton from "../components/ActionButton";
import { CheckboxRow, TextInput } from "../components/FormField";
import type { RolePermission } from "./types";

interface PermissionPickerProps {
  permissions: RolePermission[];
  selectedIds: number[];
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  onChange: (ids: number[]) => void;
}

export default function PermissionPicker({
  permissions,
  selectedIds,
  loading = false,
  error,
  disabled = false,
  onChange,
}: PermissionPickerProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return permissions;
    }
    return permissions.filter((permission) =>
      `${permission.name} ${permission.description} ${permission.group} ${permission.id}`
        .toLowerCase()
        .includes(needle)
    );
  }, [permissions, query]);

  const groups = useMemo(() => {
    const map = new Map<string, RolePermission[]>();
    for (const permission of filtered) {
      const list = map.get(permission.group) ?? [];
      list.push(permission);
      map.set(permission.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const toggle = (id: number, checked: boolean) => {
    if (checked) {
      onChange([...new Set([...selectedIds, id])]);
      return;
    }
    onChange(selectedIds.filter((item) => item !== id));
  };

  const visibleIds = filtered.map((permission) => permission.id);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Permissions
        </p>
        <p className="text-xs text-slate-500">
          {selectedIds.length} selected
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <TextInput
          placeholder="Filter permissions"
          value={query}
          disabled={disabled || loading}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex gap-2">
          <ActionButton
            tone="ghost"
            disabled={disabled || loading || visibleIds.length === 0}
            onClick={() => onChange([...new Set([...selectedIds, ...visibleIds])])}
          >
            Select visible
          </ActionButton>
          <ActionButton
            tone="ghost"
            disabled={disabled || loading || selectedIds.length === 0}
            onClick={() => onChange(selectedIds.filter((id) => !visibleIds.includes(id)))}
          >
            Clear visible
          </ActionButton>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="max-h-80 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {groups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              No permissions match this filter.
            </p>
          ) : (
            groups.map(([group, items]) => (
              <section key={group} className="space-y-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0F3952]">
                  {group}
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((permission) => (
                    <div
                      key={permission.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <CheckboxRow
                        label={`${permission.name} (#${permission.id})`}
                        checked={selected.has(permission.id)}
                        onChange={(checked) => {
                          if (!disabled) {
                            toggle(permission.id, checked);
                          }
                        }}
                      />
                      {permission.description ? (
                        <p className="mt-1 pl-6 text-[11px] leading-4 text-slate-500">
                          {permission.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
