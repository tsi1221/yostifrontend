import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { ShipmentFormValues, ShipmentMethod } from "./types";
import { EMPTY_SHIPMENT_FORM, SHIPMENT_METHODS } from "./types";
import { useCreateShipment } from "./useCreateShipment";

export default function CreateShipmentForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/logistics`;
  const { submitShipment, saving, conflict, fieldErrors } = useCreateShipment();
  const [values, setValues] = useState<ShipmentFormValues>(EMPTY_SHIPMENT_FORM);

  const setField = <K extends keyof ShipmentFormValues>(
    key: K,
    value: ShipmentFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Create New Shipment"
        description="Book cargo with pickup, destination, weight, volume, and method."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to shipments
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitShipment(values);
          if (created) {
            setValues(EMPTY_SHIPMENT_FORM);
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
          <Field label="Pickup location" error={fieldErrors.pickupLocation}>
            <TextArea
              required
              placeholder="Building 4, Yiwu International Trade City, Zhejiang"
              value={values.pickupLocation}
              onChange={(event) => setField("pickupLocation", event.target.value)}
            />
          </Field>
          <Field label="Destination notes" error={fieldErrors.destinationDescription}>
            <TextArea
              required
              placeholder="Deliver to Warehouse B, Door 3. Contact store manager on arrival."
              value={values.destinationDescription}
              onChange={(event) => setField("destinationDescription", event.target.value)}
            />
          </Field>
          <Field label="Destination country" error={fieldErrors.destinationCountry}>
            <TextInput
              required
              placeholder="Germany"
              value={values.destinationCountry}
              onChange={(event) => setField("destinationCountry", event.target.value)}
            />
          </Field>
          <Field label="City" error={fieldErrors.city}>
            <TextInput
              required
              placeholder="Berlin"
              value={values.city}
              onChange={(event) => setField("city", event.target.value)}
            />
          </Field>
          <Field label="Weight" error={fieldErrors.weight}>
            <TextInput
              required
              placeholder="250"
              value={values.weight}
              onChange={(event) => setField("weight", event.target.value)}
            />
            <p className="text-xs text-slate-400">Numbers are saved as kg, e.g. 250 kg.</p>
          </Field>
          <Field label="Volume (m³)" error={fieldErrors.volumeM3}>
            <TextInput
              required
              type="number"
              min={0}
              step="0.1"
              placeholder="4.5"
              value={values.volumeM3}
              onChange={(event) => setField("volumeM3", event.target.value)}
            />
          </Field>
          <Field label="Shipping method" error={fieldErrors.method}>
            <SelectInput
              value={values.method}
              onChange={(event) =>
                setField("method", event.target.value as ShipmentMethod)
              }
            >
              {SHIPMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
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
            {saving ? "Creating Shipment..." : "Create shipment"}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
