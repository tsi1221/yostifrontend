import { useState } from "react";

import ActionButton from "../components/ActionButton";
import DataTable, { type DataTableColumn } from "../components/DataTable";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { findUserName, useDashboard, useScopedRecords } from "../store";
import type { IssueType, SupportRequest, Urgency } from "../types";

const ISSUE_TYPES: IssueType[] = ["defect", "damage", "missing"];
const URGENCY: Urgency[] = ["low", "medium", "high"];

export default function SupportPage() {
  const { snapshot, role, actions } = useDashboard();
  const { support } = useScopedRecords();
  const staff = role === "SUPER_ADMIN" || role === "STAFF";
  const canOpen = role === "BUYER" || role === "LOGISTICS_PARTNER";

  const columns: DataTableColumn<SupportRequest>[] = [
    { header: "Ticket", render: (row) => row.support_id },
    { header: "Order", render: (row) => row.order_reference },
    { header: "Issue", render: (row) => row.issue_type },
    {
      header: "Urgency",
      render: (row) => <StatusBadge value={row.urgency} />,
    },
  ];

  if (staff) {
    columns.push({
      header: "Requester",
      render: (row) => findUserName(snapshot, row.user_id),
    });
  }

  columns.push(
    { header: "Notes", render: (row) => row.notes },
    {
      header: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    }
  );

  if (staff) {
    columns.push({
      header: "Actions",
      render: (row) =>
        row.status === "closed" ? (
          <span className="text-xs text-slate-400">Closed</span>
        ) : (
          <div className="flex gap-2">
            <ActionButton
              tone="ghost"
              onClick={() => actions.closeSupport(row.support_id, "resolved")}
            >
              Resolve
            </ActionButton>
            <ActionButton
              onClick={() => actions.closeSupport(row.support_id, "closed")}
            >
              Close
            </ActionButton>
          </div>
        ),
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={staff ? "Client support tickets" : "Support requests"}
        description={
          staff
            ? "Close or resolve buyer issues against order references."
            : "Defect, damage, and missing-item tickets tied to your orders."
        }
      />

      {canOpen ? <SupportIntake /> : null}

      <DataTable<SupportRequest>
        rows={support}
        rowKey={(row) => row.support_id}
        empty="No support requests."
        columns={columns}
      />
    </div>
  );
}

function SupportIntake() {
  const { actions } = useDashboard();
  const [form, setForm] = useState({
    order_reference: "",
    issue_type: "damage" as IssueType,
    urgency: "medium" as Urgency,
    notes: "",
  });

  return (
    <form
      className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        actions.submitSupport(form);
        setForm({
          order_reference: "",
          issue_type: "damage",
          urgency: "medium",
          notes: "",
        });
      }}
    >
      <Field label="Order reference">
        <TextInput
          required
          placeholder="Tracking, RFQ, or inspection ID"
          value={form.order_reference}
          onChange={(event) =>
            setForm({ ...form, order_reference: event.target.value })
          }
        />
      </Field>
      <Field label="Issue type">
        <SelectInput
          value={form.issue_type}
          onChange={(event) =>
            setForm({ ...form, issue_type: event.target.value as IssueType })
          }
        >
          {ISSUE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Urgency">
        <SelectInput
          value={form.urgency}
          onChange={(event) =>
            setForm({ ...form, urgency: event.target.value as Urgency })
          }
        >
          {URGENCY.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </SelectInput>
      </Field>
      <div className="md:col-span-2">
        <Field label="Notes">
          <TextArea
            required
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </Field>
      </div>
      <div>
        <ActionButton type="submit" tone="gold">
          Submit support request
        </ActionButton>
      </div>
    </form>
  );
}
