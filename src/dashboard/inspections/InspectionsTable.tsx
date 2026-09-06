import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { BADGE_TONE_CLASS, getStatusTone } from "../statusStyles";
import { useDashboard } from "../store";
import DeleteInspectionDialog from "./DeleteInspectionDialog";
import EditInspectionForm from "./EditInspectionForm";
import { formatInspectionDate, formatInspectionType } from "./inspectionsService";
import type {
  InspectionMediaFilter,
  InspectionRecord,
  InspectionTypeFilter,
} from "./types";
import { INSPECTION_MEDIA_FILTERS, INSPECTION_TYPE_FILTERS } from "./types";
import { useInspectionsList } from "./useInspectionsList";

const COLUMNS = 6;

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

function typeBadge(type: string) {
  const tone = getStatusTone(type) ?? "navy";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_TONE_CLASS[tone]}`}
    >
      {formatInspectionType(type)}
    </span>
  );
}

function MediaBadge({ required }: { required: boolean }) {
  if (required) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-800">
        <Check size={12} />
        Required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      <X size={12} />
      Optional
    </span>
  );
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

export default function InspectionsTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [editing, setEditing] = useState<InspectionRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InspectionRecord | null>(null);
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    inspections,
    meta,
    loading,
    serverError,
    retry,
  } = useInspectionsList();

  const detailPath = (id: number) => `/${ROLE_SLUG[role]}/quality-control/${id}`;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search inspections"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Product type
          </span>
          <TextInput
            value={filters.productType}
            onChange={(event) => setFilter("productType", event.target.value)}
            placeholder="Consumer Electronics"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Inspection type
          </span>
          <SelectInput
            value={filters.type}
            onChange={(event) =>
              setFilter("type", event.target.value as InspectionTypeFilter | "")
            }
          >
            {INSPECTION_TYPE_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Media
          </span>
          <SelectInput
            value={filters.photoVideoRequired}
            onChange={(event) =>
              setFilter(
                "photoVideoRequired",
                event.target.value as InspectionMediaFilter
              )
            }
          >
            {INSPECTION_MEDIA_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            On or before
          </span>
          <TextInput
            type="date"
            value={filters.date}
            onChange={(event) => setFilter("date", event.target.value)}
          />
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
                  <th className="px-4 py-3">Product type</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Scheduled date</th>
                  <th className="px-4 py-3">Media</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <SkeletonRows /> : null}

                {!loading && inspections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No inspections match the current filters.
                    </td>
                  </tr>
                ) : null}

                {!loading &&
                  inspections.map((row: InspectionRecord) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer hover:bg-slate-50/80"
                      onClick={() => navigate(detailPath(row.id))}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.id}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.productType || "—"}
                      </td>
                      <td className="px-4 py-3">{typeBadge(row.type)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatInspectionDate(row.date)}
                      </td>
                      <td className="px-4 py-3">
                        <MediaBadge required={row.photoVideoRequired} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionButton
                            tone="ghost"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(detailPath(row.id));
                            }}
                          >
                            View
                          </ActionButton>
                          <ActionButton
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing(row);
                            }}
                          >
                            Edit
                          </ActionButton>
                          <button
                            type="button"
                            className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                            aria-label={`Delete inspection request ${row.id}`}
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

      <SideDrawer
        open={Boolean(editing)}
        title={editing ? `Edit inspection #${editing.id}` : "Edit inspection"}
        description="Update booking details and save. Changes are sent with PATCH."
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditInspectionForm
            inspection={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </SideDrawer>

      <DeleteInspectionDialog
        open={Boolean(pendingDelete)}
        inspectionId={pendingDelete?.id ?? null}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => {
          if (editing && pendingDelete && editing.id === pendingDelete.id) {
            setEditing(null);
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
