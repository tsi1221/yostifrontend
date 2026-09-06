import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { TripFormValues, TripStatusValue } from "./types";
import { EMPTY_TRIP_FORM, TRIP_STATUS_VALUES } from "./types";
import { useCreateTrip } from "./useCreateTrip";

export default function CreateTripForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/trips`;
  const { submitTrip, saving, conflict, fieldErrors } = useCreateTrip();
  const [values, setValues] = useState<TripFormValues>(EMPTY_TRIP_FORM);

  const setField = <K extends keyof TripFormValues>(
    key: K,
    value: TripFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Create New Trip"
        description="Book arrival city, stay length, hotel, transport, and translator support."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to trips
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitTrip(values);
          if (created) {
            setValues(EMPTY_TRIP_FORM);
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
          <Field label="Arrival city" error={fieldErrors.arrivalCity}>
            <TextInput
              placeholder="Guangzhou"
              value={values.arrivalCity}
              onChange={(event) => setField("arrivalCity", event.target.value)}
            />
          </Field>
          <Field label="Duration" error={fieldErrors.duration}>
            <TextInput
              placeholder="7 days"
              value={values.duration}
              onChange={(event) => setField("duration", event.target.value)}
            />
            <p className="text-xs text-slate-400">
              Numbers are saved as days, e.g. 7 days.
            </p>
          </Field>
          <Field label="Hotel" error={fieldErrors.hotel}>
            <TextInput
              placeholder="Garden Hotel Guangzhou"
              value={values.hotel}
              onChange={(event) => setField("hotel", event.target.value)}
            />
          </Field>
          <Field label="Transport" error={fieldErrors.transport}>
            <TextInput
              placeholder="Private Car & Airport Transfer"
              value={values.transport}
              onChange={(event) => setField("transport", event.target.value)}
            />
          </Field>
          <Field label="Translator" error={fieldErrors.translator}>
            <TextInput
              placeholder="Li Wei (Mandarin/English)"
              value={values.translator}
              onChange={(event) => setField("translator", event.target.value)}
            />
          </Field>
          <Field label="Status" error={fieldErrors.status}>
            <SelectInput
              value={values.status}
              onChange={(event) =>
                setField("status", event.target.value as TripStatusValue)
              }
            >
              {TRIP_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectInput>
          </Field>
        </fieldset>

        <div className="flex justify-end gap-2">
          <ActionButton tone="ghost" disabled={saving} onClick={() => navigate(listPath)}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating Trip...
              </span>
            ) : (
              "Create trip"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
