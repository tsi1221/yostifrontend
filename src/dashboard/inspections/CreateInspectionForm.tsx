import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { CheckboxRow, Field, SelectInput, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { InspectionFormValues, InspectionTypeValue } from "./types";
import { EMPTY_INSPECTION_FORM, INSPECTION_TYPE_VALUES } from "./types";
import { useCreateInspection } from "./useCreateInspection";

export default function CreateInspectionForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/quality-control`;
  const { submitInspection, saving, fieldErrors } = useCreateInspection();
  const [values, setValues] = useState<InspectionFormValues>(EMPTY_INSPECTION_FORM);

  const setField = <K extends keyof InspectionFormValues>(
    key: K,
    value: InspectionFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Create Inspection Request"
        description="Book a factory check with supplier, product type, stage, and media requirements."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to inspections
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitInspection(values);
          if (created) {
            setValues(EMPTY_INSPECTION_FORM);
            navigate(listPath, { replace: true });
          }
        }}
      >
        <fieldset disabled={saving} className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                setField("type", event.target.value as InspectionTypeValue)
              }
            >
              {INSPECTION_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {type}
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
          <div className="md:col-span-2">
            <Field label="Media requirement" error={fieldErrors.photoVideoRequired}>
              <CheckboxRow
                label="Photo and video proof required"
                checked={values.photoVideoRequired}
                onChange={(checked) => setField("photoVideoRequired", checked)}
              />
            </Field>
          </div>
        </fieldset>

        <div className="flex justify-end gap-2">
          <ActionButton tone="ghost" disabled={saving} onClick={() => navigate(listPath)}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={saving}>
            {saving ? "Submitting Request..." : "Submit inspection request"}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
