import { useState } from "react";
import { Trash2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import SideDrawer from "../components/SideDrawer";
import { BADGE_TONE_CLASS, getStatusTone } from "../statusStyles";
import DeleteShipmentDialog from "./DeleteShipmentDialog";
import EditShipmentForm from "./EditShipmentForm";
import type { ShipmentMethodFilter, ShipmentRecord } from "./types";
import { SHIPMENT_METHOD_FILTERS } from "./types";
import { useShipmentsList } from "./useShipmentsList";

const COLUMNS = 6;

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

function methodBadge(method: string) {
  const tone = getStatusTone(method) ?? "navy";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_TONE_CLASS[tone]}`}
    >
      {method}
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

export default function ShipmentsTable() {
  const [editing, setEditing] = useState<ShipmentRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ShipmentRecord | null>(null);
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    shipments,
    meta,
    loading,
    serverError,
    retry,
  } = useShipmentsList();

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
            placeholder="Search pickup or city"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Method
          </span>
          <SelectInput
            value={filters.method}
            onChange={(event) =>
              setFilter("method", event.target.value as ShipmentMethodFilter | "")
            }
          >
            {SHIPMENT_METHOD_FILTERS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Destination country
          </span>
          <TextInput
            value={filters.destinationCountry}
            onChange={(event) => setFilter("destinationCountry", event.target.value)}
            placeholder="Germany"
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Shipments could not be loaded
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Retry Fetch
          </ActionButton>
        </section>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <SkeletonRows /> : null}

                {!loading && shipments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={COLUMNS}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No shipments match the current filters.
                    </td>
                  </tr>
                ) : null}

                {!loading &&
                  shipments.map((row: ShipmentRecord) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.id}
                      </td>
                      <td className="px-4 py-3">{methodBadge(row.method)}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium text-slate-800">
                          {row.pickupLocation || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          to {[row.city, row.destinationCountry].filter(Boolean).join(", ") || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.weight || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.volumeM3} m³
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionButton onClick={() => setEditing(row)}>
                            Edit
                          </ActionButton>
                          <button
                            type="button"
                            className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                            aria-label={`Delete shipment ${row.id}`}
                            onClick={() => setPendingDelete(row)}
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
      )}

      <SideDrawer
        open={Boolean(editing)}
        title={editing ? `Edit shipment #${editing.id}` : "Edit shipment"}
        description="Update cargo details and save. Changes are sent with PATCH."
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditShipmentForm
            shipment={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </SideDrawer>

      <DeleteShipmentDialog
        open={Boolean(pendingDelete)}
        shipmentId={pendingDelete?.id ?? null}
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
