import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import SideDrawer from "../components/SideDrawer";
import StatusBadge from "../components/StatusBadge";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import DeleteTripDialog from "./DeleteTripDialog";
import EditTripForm from "./EditTripForm";
import type { TripRecord, TripStatusFilter } from "./types";
import { TRIP_STATUS_FILTERS } from "./types";
import { formatTripStatus } from "./tripsService";
import { useTripsList } from "./useTripsList";

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

export default function TripsTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [editing, setEditing] = useState<TripRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TripRecord | null>(null);
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    trips,
    meta,
    loading,
    serverError,
    retry,
  } = useTripsList();

  const detailPath = (id: number) => `/${ROLE_SLUG[role]}/trips/${id}`;

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
            placeholder="Search trips"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Arrival city
          </span>
          <TextInput
            value={filters.arrivalCity}
            onChange={(event) => setFilter("arrivalCity", event.target.value)}
            placeholder="Yiwu"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Status
          </span>
          <SelectInput
            value={filters.status}
            onChange={(event) =>
              setFilter("status", event.target.value as TripStatusFilter | "")
            }
          >
            {TRIP_STATUS_FILTERS.map((option) => (
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
                <th className="px-4 py-3">Destination city</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Hotel</th>
                <th className="px-4 py-3">Transport</th>
                <th className="px-4 py-3">Translator</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <SkeletonRows /> : null}

              {!loading && trips.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    {serverError
                      ? "Trip results will appear here after a successful fetch."
                      : "No trips match the current filters."}
                  </td>
                </tr>
              ) : null}

              {!loading &&
                trips.map((row: TripRecord) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() => navigate(detailPath(row.id))}
                  >
                    <td className="px-4 py-3">
                      <p className="text-base font-semibold text-[#0F3952]">
                        {row.arrivalCity || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.duration || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.hotel || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.transport || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{row.translator || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={formatTripStatus(row.status)} />
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
                          aria-label={`Delete trip itinerary ${row.id}`}
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
        title={editing ? `Edit trip #${editing.id}` : "Edit trip itinerary"}
        description="Update itinerary details and save. Changes are sent with PATCH."
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditTripForm
            trip={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </SideDrawer>

      <DeleteTripDialog
        open={Boolean(pendingDelete)}
        tripId={pendingDelete?.id ?? null}
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
