import { useEffect, useState } from "react";

import ActionButton from "../components/ActionButton";
import { CheckboxRow, Field, SelectInput, TextInput } from "../components/FormField";
import { inspectionToFormValues } from "./inspectionsService";
import type {
  InspectionRecord,
  InspectionUpdateTypeValue,
  UpdateInspectionFormValues,
} from "./types";
import { INSPECTION_UPDATE_TYPE_OPTIONS } from "./types";
import { useUpdateInspection } from "./useUpdateInspection";

interface EditInspectionFormProps {
  inspection: InspectionRecord;
  onCancel: () => void;
  onSaved: (updated: InspectionRecord) => void;
}

export default function EditInspectionForm({
  inspection,
  onCancel,
  onSaved,
}: EditInspectionFormProps) {
  const { updateInspection, saving, fieldErrors } = useUpdateInspection(inspection.id);
  const [values, setValues] = useState<UpdateInspectionFormValues>(() =>
    inspectionToFormValues(inspection)
  );

  useEffect(() => {
    setValues(inspectionToFormValues(inspection));
  }, [inspection]);

  const setField = <K extends keyof UpdateInspectionFormValues>(
    key: K,
    value: UpdateInspectionFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateInspection(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    >
      <fieldset disabled={saving} className="space-y-4">
        <Field label="Supplier ID" error={fieldErrors.supplierId}>
          <TextInput
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="4"
            value={values.supplierId}
            onChange={(event) => setField("supplierId", event.target.value)}
          />
          <p className="text-xs text-slate-400">
            Sent as an integer, e.g. 4.
          </p>
        </Field>
        <Field label="Product type" error={fieldErrors.productType}>
          <TextInput
            placeholder="Consumer Electronics"
            value={values.productType}
            onChange={(event) => setField("productType", event.target.value)}
          />
        </Field>
        <Field label="Inspection type" error={fieldErrors.type}>
          <SelectInput
            value={values.type}
            onChange={(event) =>
              setField("type", event.target.value as InspectionUpdateTypeValue)
            }
          >
            {INSPECTION_UPDATE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Date and time" error={fieldErrors.date}>
          <TextInput
            type="datetime-local"
            value={values.date}
            onChange={(event) => setField("date", event.target.value)}
          />
          <p className="text-xs text-slate-400">
            Saved as an ISO timestamp, e.g. 2026-10-15T09:00:00.000Z.
          </p>
        </Field>
        <Field label="Media requirement" error={fieldErrors.photoVideoRequired}>
          <CheckboxRow
            label="Photo and video proof required"
            checked={values.photoVideoRequired}
            onChange={(checked) => setField("photoVideoRequired", checked)}
          />
        </Field>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? "Updating Inspection..." : "Save inspection"}
        </ActionButton>
      </div>
    </form>
  );
}
