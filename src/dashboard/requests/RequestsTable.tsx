import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import DeleteRequestDialog from "./DeleteRequestDialog";
import { SelectInput, TextInput } from "../components/FormField";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import {
  formatDeadline,
  formatMoney,
  requestStatusClass,
} from "./format";
import type { SourcingRequestRecord } from "./types";
import { REQUEST_REGIONS } from "./types";
import { useRequestsList } from "./useRequestsList";

const COLUMNS = 8;

function rangeLabel(page: number, limit: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
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

export default function RequestsTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [pendingDelete, setPendingDelete] = useState<SourcingRequestRecord | null>(null);
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    requests,
    meta,
    loading,
    forbidden,
    serverError,
    retry,
  } = useRequestsList();

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
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search requests"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Region
          </span>
          <SelectInput
            value={filters.supplierRegion}
            onChange={(event) =>
              setFilter(
                "supplierRegion",
                event.target.value as typeof filters.supplierRegion
              )
            }
          >
            <option value="">All Regions</option>
            {REQUEST_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Deadline on or before
          </span>
          <TextInput
            type="date"
            value={filters.deadline}
            onChange={(event) => setFilter("deadline", event.target.value)}
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Requests could not be loaded
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Refresh requests
          </ActionButton>
        </section>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Product name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Target price</th>
                <th className="px-4 py-3">Supplier region</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <SkeletonRows /> : null}

              {!loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS} className="px-4 py-12 text-center text-sm text-slate-500">
                    No sourcing requests match the current filters.
                  </td>
                </tr>
              ) : null}

              {!loading &&
                requests.map((row: SourcingRequestRecord) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() => navigate(`/${ROLE_SLUG[role]}/sourcing/${row.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {row.productName}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      <p className="truncate" title={row.description}>
                        {row.description || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {formatMoney(row.targetPrice)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.supplierRegion}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDeadline(row.deadline)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${requestStatusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionButton
                          tone="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/${ROLE_SLUG[role]}/sourcing/${row.id}`);
                          }}
                        >
                          View
                        </ActionButton>
                        <ActionButton
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/${ROLE_SLUG[role]}/sourcing/${row.id}?edit=1`);
                          }}
                        >
                          Edit
                        </ActionButton>
                        <button
                          type="button"
                          className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                          aria-label={`Delete ${row.productName}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setPendingDelete(row);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {rangeLabel(meta.page, meta.limit, meta.total)}
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

      <DeleteRequestDialog
        open={Boolean(pendingDelete)}
        requestId={pendingDelete?.id ?? ""}
        productName={pendingDelete?.productName ?? "this request"}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => {
          setPendingDelete(null);
          retry();
        }}
      />
    </div>
  );
}
