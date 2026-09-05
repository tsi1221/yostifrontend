import { useEffect, useState } from "react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextInput } from "../components/FormField";
import { tripToFormValues } from "./tripsService";
import type {
  TripRecord,
  TripUpdateStatusValue,
  UpdateTripFormValues,
} from "./types";
import { TRIP_UPDATE_STATUS_OPTIONS } from "./types";
import { useUpdateTrip } from "./useUpdateTrip";

interface EditTripFormProps {
  trip: TripRecord;
  onCancel: () => void;
  onSaved: (updated: TripRecord) => void;
}

export default function EditTripForm({ trip, onCancel, onSaved }: EditTripFormProps) {
  const { updateTrip, saving, conflict, fieldErrors } = useUpdateTrip(trip.id);
  const [values, setValues] = useState<UpdateTripFormValues>(() =>
    tripToFormValues(trip)
  );

  useEffect(() => {
    setValues(tripToFormValues(trip));
  }, [trip]);

  const setField = <K extends keyof UpdateTripFormValues>(
    key: K,
    value: UpdateTripFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateTrip(values);
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
              setField("status", event.target.value as TripUpdateStatusValue)
            }
          >
            {TRIP_UPDATE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? "Saving Changes..." : "Save changes"}
        </ActionButton>
      </div>
    </form>
  );
}
