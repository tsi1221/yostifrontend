import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextInput } from "../components/FormField";
import { asSupportTicketId, ticketToFormValues } from "./ticketsService";
import type {
  TicketRecord,
  TicketUpdateIssuesType,
  TicketUpdateResolutionValue,
  TicketUpdateStatusValue,
  TicketUrgencyValue,
  UpdateSupportFormValues,
} from "./types";
import {
  TICKET_UPDATE_ISSUES_TYPE_OPTIONS,
  TICKET_UPDATE_RESOLUTION_OPTIONS,
  TICKET_UPDATE_STATUS_OPTIONS,
  TICKET_URGENCY_OPTIONS,
} from "./types";
import { useUpdateSupport } from "./useUpdateSupport";

interface EditTicketFormProps {
  ticket: TicketRecord;
  onCancel: () => void;
  onSaved: (updated: TicketRecord) => void;
}

const STATUS_BUTTON_CLASS: Record<TicketUpdateStatusValue, string> = {
  open: "border-amber-400 bg-amber-100 text-amber-800",
  resolved: "border-green-600 bg-green-600 text-white",
  close: "border-red-500 bg-red-100 text-red-700",
};

export default function EditTicketForm({
  ticket,
  onCancel,
  onSaved,
}: EditTicketFormProps) {
  const ticketId = asSupportTicketId(ticket.id) ?? 0;
  const { updateSupport, saving, conflict, fieldErrors } = useUpdateSupport(ticketId);
  const [values, setValues] = useState<UpdateSupportFormValues>(() =>
    ticketToFormValues(ticket)
  );

  useEffect(() => {
    setValues(ticketToFormValues(ticket));
  }, [ticket]);

  const setField = <K extends keyof UpdateSupportFormValues>(
    key: K,
    value: UpdateSupportFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateSupport(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    >
      {conflict ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {conflict}
        </div>
      ) : null}

      <fieldset disabled={saving} className="space-y-4">
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
              setField("issuesType", event.target.value as TicketUpdateIssuesType)
            }
          >
            {TICKET_UPDATE_ISSUES_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Title" error={fieldErrors.title}>
          <TextInput
            placeholder="Damaged item received in shipment box"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </Field>
        <Field label="Resolution to request" error={fieldErrors.resolutionToRequest}>
          <SelectInput
            value={values.resolutionToRequest}
            onChange={(event) =>
              setField(
                "resolutionToRequest",
                event.target.value as TicketUpdateResolutionValue
              )
            }
          >
            {TICKET_UPDATE_RESOLUTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Urgency" error={fieldErrors.urgency}>
          <SelectInput
            value={values.urgency}
            onChange={(event) =>
              setField("urgency", event.target.value as TicketUrgencyValue)
            }
          >
            {TICKET_URGENCY_OPTIONS.map((option) => (
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
        <Field label="Status" error={fieldErrors.status}>
          <SelectInput
            value={values.status}
            onChange={(event) =>
              setField("status", event.target.value as TicketUpdateStatusValue)
            }
          >
            {TICKET_UPDATE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
          <div
            className="grid grid-cols-3 gap-2 pt-1"
            role="group"
            aria-label="Ticket status"
          >
            {TICKET_UPDATE_STATUS_OPTIONS.map((option) => {
              const selected = values.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setField("status", option.value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    selected
                      ? STATUS_BUTTON_CLASS[option.value]
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#0F3952]/40"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Field>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating Ticket...
            </span>
          ) : (
            "Save changes"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
