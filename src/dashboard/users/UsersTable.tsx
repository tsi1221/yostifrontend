import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import type { ManagedUser } from "./types";
import { USER_ROLE_FILTERS } from "./types";
import { useUsersList } from "./useUsersList";

const COLUMNS = 7;

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

export default function UsersTable() {
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    users,
    meta,
    loading,
    forbidden,
    error,
    retry,
  } = useUsersList();

  if (forbidden) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-red-700">Access Denied</p>
        <p className="mt-2 text-sm text-red-600">
          You do not have the required permissions to view this resource.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global name
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search by name"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Role
          </span>
          <SelectInput
            value={filters.roleId === "" ? "" : String(filters.roleId)}
            onChange={(event) =>
              setFilter(
                "roleId",
                event.target.value ? Number(event.target.value) : ""
              )
            }
          >
            <option value="">All roles</option>
            {USER_ROLE_FILTERS.map((role) => (
              <option key={role.roleId} value={role.roleId}>
                {role.label}
              </option>
            ))}
          </SelectInput>
        </label>
      </section>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <SkeletonRows /> : null}

              {!loading && error ? (
                <tr>
                  <td colSpan={COLUMNS} className="px-4 py-12 text-center">
                    <p className="text-sm text-slate-600">{error}</p>
                    <ActionButton className="mt-4" onClick={retry}>
                      Retry
                    </ActionButton>
                  </td>
                </tr>
              ) : null}

              {!loading && !error && users.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS} className="px-4 py-12 text-center text-sm text-slate-500">
                    No users match the current filters.
                  </td>
                </tr>
              ) : null}

              {!loading &&
                !error &&
                users.map((user: ManagedUser) => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {user.fullname}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {user.companyName || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {user.phoneWhatsapp || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {user.country || "—"}
                    </td>
                    <td className="px-4 py-3 uppercase text-slate-700">
                      {user.language_preference}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#0F3952]/10 px-2.5 py-1 text-xs font-semibold text-[#0F3952]">
                        {user.role.name}
                      </span>
                      {user.role.description ? (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {user.role.description}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
