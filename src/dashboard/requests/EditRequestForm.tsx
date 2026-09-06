import { useEffect, useState } from "react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormField";
import { formValuesToPayload, requestToFormValues } from "./format";
import type { RequestFormValues, RequestRegion, SourcingRequestRecord } from "./types";
import { REQUEST_REGIONS, REQUEST_STATUSES } from "./types";
import { useUpdateRequest } from "./useUpdateRequest";

interface EditRequestFormProps {
  request: SourcingRequestRecord;
  onCancel: () => void;
  onSaved: (updated: SourcingRequestRecord) => void;
}

export default function EditRequestForm({
  request,
  onCancel,
  onSaved,
}: EditRequestFormProps) {
  const { updateRequest, saving, conflict, fieldErrors } = useUpdateRequest(request.id);
  const [values, setValues] = useState<RequestFormValues>(() =>
    requestToFormValues(request)
  );

  useEffect(() => {
    setValues(requestToFormValues(request));
  }, [request]);

  const setField = <K extends keyof RequestFormValues>(
    key: K,
    value: RequestFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const statusOptions = REQUEST_STATUSES.includes(
    values.status as (typeof REQUEST_STATUSES)[number]
  )
    ? REQUEST_STATUSES
    : [values.status, ...REQUEST_STATUSES];

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateRequest(formValuesToPayload(values, request));
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
        <Field label="Product name" error={fieldErrors.productName}>
          <TextInput
            required
            value={values.productName}
            onChange={(event) => setField("productName", event.target.value)}
          />
        </Field>
        <Field label="Description" error={fieldErrors.description}>
          <TextArea
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity" error={fieldErrors.quantity}>
            <TextInput
              type="number"
              min={1}
              required
              value={values.quantity}
              onChange={(event) => setField("quantity", event.target.value)}
            />
          </Field>
          <Field label="Target price" error={fieldErrors.targetPrice}>
            <TextInput
              type="number"
              min={0}
              step="0.01"
              required
              value={values.targetPrice}
              onChange={(event) => setField("targetPrice", event.target.value)}
            />
          </Field>
        </div>
        <Field label="Supplier region" error={fieldErrors.supplierRegion}>
          <SelectInput
            value={values.supplierRegion}
            onChange={(event) =>
              setField("supplierRegion", event.target.value as RequestRegion)
            }
          >
            {REQUEST_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Deadline" error={fieldErrors.deadline}>
          <TextInput
            type="date"
            required
            value={values.deadline}
            onChange={(event) => setField("deadline", event.target.value)}
          />
        </Field>
        <Field label="Status" error={fieldErrors.status}>
          <SelectInput
            value={values.status}
            onChange={(event) => setField("status", event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
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
          {saving ? "Saving updates..." : "Save updates"}
        </ActionButton>
      </div>
    </form>
  );
}
