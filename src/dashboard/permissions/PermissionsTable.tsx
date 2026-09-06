import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import { permissionGroup } from "./api";
import { usePermissionsList } from "./usePermissionsList";

const COLUMNS = 4;

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

export default function PermissionsTable() {
  const {
    filters,
    setSearch,
    setPage,
    setPageSize,
    permissions,
    meta,
    loading,
    serverError,
    retry,
  } = usePermissionsList();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search permission name"
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      {loading && permissions.length === 0 && !serverError ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-10 text-sm text-slate-500 shadow-sm">
          <Loader2 size={16} className="animate-spin text-[#0F3952]" />
          Loading permissions…
        </div>
      ) : null}

      {(!serverError || permissions.length > 0) && !(loading && permissions.length === 0) ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <SkeletonRows /> : null}
                {!loading && permissions.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS} className="px-4 py-10 text-center text-slate-500">
                      {filters.search.trim()
                        ? "No permissions match this search."
                        : "No permissions are published yet."}
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? permissions.map((permission) => (
                      <tr key={permission.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-[#0F3952]">{permission.id}</td>
                        <td className="px-4 py-3 font-mono text-sm font-semibold text-[#0F3952]">
                          {permission.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{permissionGroup(permission.name)}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {permission.description || "—"}
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
      ) : null}
    </div>
  );
}
