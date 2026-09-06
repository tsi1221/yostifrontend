import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import EditRoleForm from "./EditRoleForm";
import RoleEmptyState from "./RoleEmptyState";
import { snippet } from "./api";
import type { RoleRecord } from "./types";
import { useRolesList } from "./useRolesList";

const COLUMNS = 5;

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }, (_, row) => (
        <tr key={`skeleton-${row}`}>
          {Array.from({ length: COLUMNS }, (_, cell) => (
            <td key={cell} className="px-4 py-3">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function RolesTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const createPath = `/${ROLE_SLUG[role]}/roles/new`;
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    roles,
    meta,
    loading,
    serverError,
    retry,
  } = useRolesList();
  const [editing, setEditing] = useState<RoleRecord | null>(null);

  const detailPath = (id: number) => `/${ROLE_SLUG[role]}/roles/${id}`;
  const filtersEmpty = !filters.search.trim() && !filters.name.trim();
  const showFirstEmpty = !loading && !serverError && meta.total === 0 && filtersEmpty;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search roles"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Name
          </span>
          <TextInput
            value={filters.name}
            onChange={(event) => setFilter("name", event.target.value)}
            placeholder="Filter by role name"
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      {showFirstEmpty ? (
        <RoleEmptyState onAction={() => navigate(createPath)} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <SkeletonRows /> : null}
                {!loading && roles.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS} className="px-4 py-10 text-center text-slate-500">
                      No roles match these filters.
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? roles.map((item) => (
                      <tr
                        key={item.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(detailPath(item.id))}
                      >
                        <td className="px-4 py-3 font-medium text-[#0F3952]">{item.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#0F3952]">{item.name}</td>
                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          {snippet(item.description, 90) || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.permissionIds.length}</td>
                        <td className="px-4 py-3">
                          <ActionButton
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing(item);
                            }}
                          >
                            Edit
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {rangeLabel(meta.page, meta.pageSize, meta.total)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <SelectInput
                value={String(filters.pageSize)}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="w-auto"
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </SelectInput>
              <ActionButton
                tone="ghost"
                disabled={meta.page <= 1 || loading}
                onClick={() => setPage(meta.page - 1)}
              >
                Previous
              </ActionButton>
              <span className="px-2 text-sm font-medium text-[#0F3952]">
                {meta.page} / {Math.max(meta.totalPages, 1)}
              </span>
              <ActionButton
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => setPage(meta.page + 1)}
              >
                Next
              </ActionButton>
            </div>
          </footer>
        </div>
      )}

      <SideDrawer
        open={Boolean(editing)}
        title={editing ? `Edit role #${editing.id}` : "Edit role"}
        description="Update the name, description, and assigned permission IDs."
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditRoleForm
            role={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </SideDrawer>
    </div>
  );
}
