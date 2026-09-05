import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { TicketFormValues, TicketUrgencyValue } from "./types";
import {
  EMPTY_TICKET_FORM,
  TICKET_ISSUES_TYPE_OPTIONS,
  TICKET_RESOLUTION_OPTIONS,
  TICKET_URGENCY_OPTIONS,
} from "./types";
import { useCreateTicket } from "./useCreateTicket";

function UrgencyToggle({
  value,
  onChange,
}: {
  value: TicketUrgencyValue;
  onChange: (value: TicketUrgencyValue) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Urgency">
      {TICKET_URGENCY_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border-2 px-3 py-3 text-left transition ${
              selected
                ? "border-[#FDC700] bg-[#0F3952] text-white"
                : "border-slate-200 bg-white text-[#0F3952] hover:border-[#0F3952]/40"
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className={`mt-0.5 block text-xs ${selected ? "text-white/80" : "text-slate-500"}`}>
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function CreateTicketForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/supports`;
  const { submitTicket, saving, conflict, fieldErrors } = useCreateTicket();
  const [values, setValues] = useState<TicketFormValues>(EMPTY_TICKET_FORM);

  const setField = <K extends keyof TicketFormValues>(
    key: K,
    value: TicketFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Create Support Ticket"
        description="Open a ticket with the order reference, issue type, and requested resolution."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to support
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitTicket(values);
          if (created) {
            setValues(EMPTY_TICKET_FORM);
            navigate(listPath, { replace: true });
          }
        }}
      >
        {conflict ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {conflict}
          </div>
        ) : null}

        <fieldset disabled={saving} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Order reference" error={fieldErrors.orderReference}>
            <TextInput
              placeholder="ORD-98765-XYZ"
              value={values.orderReference}
              onChange={(event) => setField("orderReference", event.target.value)}
            />
          </Field>
          <Field label="Issue type" error={fieldErrors.issuesType}>
            <SelectInput
              value={values.issuesType}
              onChange={(event) =>
                setField(
                  "issuesType",
                  event.target.value as TicketFormValues["issuesType"]
                )
              }
            >
              {TICKET_ISSUES_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="md:col-span-2">
            <Field label="Title" error={fieldErrors.title}>
              <TextInput
                placeholder="Damaged item received in shipment box"
                value={values.title}
                onChange={(event) => setField("title", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Resolution to request" error={fieldErrors.resolutionToRequest}>
            <SelectInput
              value={values.resolutionToRequest}
              onChange={(event) =>
                setField(
                  "resolutionToRequest",
                  event.target.value as TicketFormValues["resolutionToRequest"]
                )
              }
            >
              {TICKET_RESOLUTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Attachment URL" error={fieldErrors.attachment}>
            <TextInput
              type="url"
              placeholder="https://storage.example.com/proofs/damage-image.jpg"
              value={values.attachment}
              onChange={(event) => setField("attachment", event.target.value)}
            />
            <p className="text-xs text-slate-400">
              Optional. If provided, it must be a full http(s) URL.
            </p>
          </Field>
          <div className="md:col-span-2">
            <Field label="Urgency" error={fieldErrors.urgency}>
              <UrgencyToggle
                value={values.urgency}
                onChange={(urgency) => setField("urgency", urgency)}
              />
            </Field>
          </div>
        </fieldset>

        <div className="flex justify-end gap-2">
          <ActionButton tone="ghost" disabled={saving} onClick={() => navigate(listPath)}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Submitting Ticket...
              </span>
            ) : (
              "Submit ticket"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
