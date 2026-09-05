import { useMemo, useState } from "react";

import ActionButton from "../components/ActionButton";
import DataTable from "../components/DataTable";
import {
  CheckboxRow,
  Field,
  SelectInput,
  TextInput,
} from "../components/FormField";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { findSupplierName, useDashboard, useScopedRecords } from "../store";
import type {
  InspectionStatus,
  InspectionType,
  QualityInspection,
} from "../types";

const INSPECTION_TYPES: InspectionType[] = [
  "sample",
  "pre-shipment",
  "factory visit",
];

export default function InspectionsPage() {
  const { role } = useDashboard();

  if (role === "BUYER") {
    return <BuyerInspectionForm />;
  }
  if (role === "SUPPLIER") {
    return <SupplierInspectionCalendar />;
  }
  return <StaffQualityDesk />;
}

function BuyerInspectionForm() {
  const { snapshot, actions } = useDashboard();
  const { inspections } = useScopedRecords();
  const [form, setForm] = useState({
    product_type: "",
    inspection_type: "pre-shipment" as InspectionType,
    photo_video_required: true,
    supplier_id: snapshot.suppliers[0]?.supplier_id ?? "",
    scheduled_date: "2026-09-20",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Request Quality Inspection"
        description="Book sample, pre-shipment, or factory-visit checks."
      />
      <form
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          actions.requestInspection(form);
          setForm({ ...form, product_type: "" });
        }}
      >
        <Field label="Product type">
          <TextInput
            required
            value={form.product_type}
            onChange={(event) =>
              setForm({ ...form, product_type: event.target.value })
            }
          />
        </Field>
        <Field label="Inspection type">
          <SelectInput
            value={form.inspection_type}
            onChange={(event) =>
              setForm({
                ...form,
                inspection_type: event.target.value as InspectionType,
              })
            }
          >
            {INSPECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Factory">
          <SelectInput
            value={form.supplier_id}
            onChange={(event) =>
              setForm({ ...form, supplier_id: event.target.value })
            }
          >
            {snapshot.suppliers.map((factory) => (
              <option key={factory.supplier_id} value={factory.supplier_id}>
                {factory.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Preferred date">
          <TextInput
            type="date"
            value={form.scheduled_date}
            onChange={(event) =>
              setForm({ ...form, scheduled_date: event.target.value })
            }
          />
        </Field>
        <CheckboxRow
          label="Photo / video required"
          checked={form.photo_video_required}
          onChange={(value) =>
            setForm({ ...form, photo_video_required: value })
          }
        />
        <div className="md:col-span-2">
          <ActionButton type="submit" tone="gold">
            Request inspection
          </ActionButton>
        </div>
      </form>

      <DataTable<QualityInspection>
        rows={inspections}
        rowKey={(row) => row.inspection_id}
        empty="No inspections yet."
        columns={[
          { header: "ID", render: (row) => row.inspection_id },
          { header: "Product", render: (row) => row.product_type },
          { header: "Type", render: (row) => row.inspection_type },
          { header: "Date", render: (row) => row.scheduled_date },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />
    </div>
  );
}

function SupplierInspectionCalendar() {
  const { inspections } = useScopedRecords();
  const days = useMemo(() => buildSeptemberGrid(2026), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Inspections"
        description="Factory check windows for September 2026."
      />
      <div className="grid grid-cols-7 gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <p
            key={day}
            className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"
          >
            {day}
          </p>
        ))}
        {days.map((day, index) => {
          const iso = day ? `2026-09-${String(day).padStart(2, "0")}` : "";
          const hits = inspections.filter((row) => row.scheduled_date === iso);
          return (
            <div
              key={iso || `pad-${index}`}
              className="min-h-[92px] rounded-xl bg-slate-50 p-2"
            >
              {day ? (
                <>
                  <p className="text-xs font-semibold text-[#0F3952]">{day}</p>
                  {hits.map((hit) => (
                    <p
                      key={hit.inspection_id}
                      className="mt-1 rounded-lg bg-[#FDC700]/40 px-1.5 py-1 text-[10px] font-semibold text-[#0F3952]"
                    >
                      {hit.inspection_type}
                    </p>
                  ))}
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <DataTable<QualityInspection>
        rows={inspections}
        rowKey={(row) => row.inspection_id}
        empty="No inspections assigned."
        columns={[
          { header: "ID", render: (row) => row.inspection_id },
          { header: "Product", render: (row) => row.product_type },
          { header: "Window", render: (row) => row.scheduled_date },
          { header: "Type", render: (row) => row.inspection_type },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />
    </div>
  );
}

function StaffQualityDesk() {
  const { snapshot, actions } = useDashboard();
  const { inspections } = useScopedRecords();

  return (
    <div>
      <PageHeader
        title="Quality reports"
        description="Verify inspection outcomes and attach report URLs."
      />
      <DataTable<QualityInspection>
        rows={inspections}
        rowKey={(row) => row.inspection_id}
        empty="No inspections."
        columns={[
          { header: "ID", render: (row) => row.inspection_id },
          { header: "Product", render: (row) => row.product_type },
          {
            header: "Factory",
            render: (row) => findSupplierName(snapshot, row.supplier_id),
          },
          { header: "Type", render: (row) => row.inspection_type },
          {
            header: "Media",
            render: (row) => (row.photo_video_required ? "Required" : "Optional"),
          },
          {
            header: "Status",
            render: (row) => (
              <SelectInput
                value={row.status}
                onChange={(event) =>
                  actions.updateInspection(
                    row.inspection_id,
                    event.target.value as InspectionStatus
                  )
                }
              >
                {["pending", "scheduled", "in progress", "completed"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </SelectInput>
            ),
          },
          {
            header: "Report",
            render: (row) => (
              <TextInput
                placeholder="/reports/..."
                defaultValue={row.report_url}
                onBlur={(event) =>
                  actions.updateInspection(
                    row.inspection_id,
                    row.status,
                    event.target.value
                  )
                }
              />
            ),
          },
        ]}
      />
    </div>
  );
}

function buildSeptemberGrid(year: number) {
  const first = new Date(Date.UTC(year, 8, 1));
  const weekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = 30;
  const cells: Array<number | null> = Array.from({ length: weekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}
