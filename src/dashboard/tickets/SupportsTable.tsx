import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type {
  TicketIssuesTypeFilter,
  TicketRecord,
  TicketResolutionFilter,
  TicketStatusFilter,
  TicketUrgencyFilter,
} from "./types";
import {
  TICKET_ISSUES_TYPE_FILTERS,
  TICKET_RESOLUTION_FILTERS,
  TICKET_STATUS_FILTERS,
  TICKET_URGENCY_FILTERS,
} from "./types";
import { useSupportsList } from "./useSupportsList";

const COLUMNS = 8;

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

export default function SupportsTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    tickets,
    meta,
    loading,
    serverError,
    retry,
  } = useSupportsList();

  const detailPath = (id: number | string) => `/${ROLE_SLUG[role]}/supports/${id}`;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search tickets"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Order reference
          </span>
          <TextInput
            value={filters.orderReference}
            onChange={(event) => setFilter("orderReference", event.target.value)}
            placeholder="Order reference"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Issue type
          </span>
          <SelectInput
            value={filters.issuesType}
            onChange={(event) =>
              setFilter("issuesType", event.target.value as TicketIssuesTypeFilter | "")
            }
          >
            {TICKET_ISSUES_TYPE_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Resolution
          </span>
          <SelectInput
            value={filters.resolutionToRequest}
            onChange={(event) =>
              setFilter(
                "resolutionToRequest",
                event.target.value as TicketResolutionFilter | ""
              )
            }
          >
            {TICKET_RESOLUTION_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Urgency
          </span>
          <SelectInput
            value={filters.urgency}
            onChange={(event) =>
              setFilter("urgency", event.target.value as TicketUrgencyFilter | "")
            }
          >
            {TICKET_URGENCY_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Status
          </span>
          <SelectInput
            value={filters.status}
            onChange={(event) =>
              setFilter("status", event.target.value as TicketStatusFilter | "")
            }
          >
            {TICKET_STATUS_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
      </section>

      {serverError && !loading ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Order reference</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Issue type</th>
                <th className="px-4 py-3">Resolution</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <SkeletonRows /> : null}

              {!loading && tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    {serverError
                      ? "Support ticket results will appear here after a successful fetch."
                      : "No support tickets match the current filters."}
                  </td>
                </tr>
              ) : null}

              {!loading &&
                tickets.map((row: TicketRecord) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() => navigate(detailPath(row.id))}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{row.id}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.orderReference || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.title || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.issuesType || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.resolutionToRequest || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.urgency || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status || "—"} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionButton
                        tone="ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(detailPath(row.id));
                        }}
                      >
                        View
                      </ActionButton>
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
