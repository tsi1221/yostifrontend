import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import DataTable from "../components/DataTable";
import { SelectInput, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { ROLE_SLUG } from "../roles";
import { findSupplierName, useDashboard, useScopedRecords } from "../store";
import type { InspectionStatus, QualityInspection } from "../types";

function NewInspectionButton() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  return (
    <ActionButton
      onClick={() => navigate(`/${ROLE_SLUG[role]}/quality-control/new`)}
    >
      New inspection
    </ActionButton>
  );
}

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
  const { inspections } = useScopedRecords();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Request Quality Inspection"
        description="Book sample, pre-shipment, or factory-visit checks."
        actions={<NewInspectionButton />}
      />

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
  const { year, month, label, days } = useMemo(
    () => buildCalendarMonth(inspections.map((row) => row.scheduled_date)),
    [inspections]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Inspections"
        description={`Factory check windows for ${label}.`}
        actions={<NewInspectionButton />}
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
          const iso = day
            ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            : "";
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
        actions={<NewInspectionButton />}
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

function buildCalendarMonth(dates: string[]) {
  const counts = new Map<string, number>();
  dates.forEach((iso) => {
    const key = iso.slice(0, 7);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const pivot =
    [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "2026-09";
  const [yearText, monthText] = pivot.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const weekday = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: Array<number | null> = Array.from({ length: weekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  const label = first.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { year, month, label, days };
}
