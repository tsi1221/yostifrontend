import { useEffect, useState } from "react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormField";
import { shipmentToFormValues } from "./shipmentsService";
import type { ShipmentMethodValue, ShipmentRecord, UpdateShipmentFormValues } from "./types";
import { SHIPMENT_METHOD_OPTIONS } from "./types";
import { useUpdateShipment } from "./useUpdateShipment";

interface EditShipmentFormProps {
  shipment: ShipmentRecord;
  onCancel: () => void;
  onSaved: (updated: ShipmentRecord) => void;
}

export default function EditShipmentForm({
  shipment,
  onCancel,
  onSaved,
}: EditShipmentFormProps) {
  const { updateShipment, saving, fieldErrors } = useUpdateShipment(shipment.id);
  const [values, setValues] = useState<UpdateShipmentFormValues>(() =>
    shipmentToFormValues(shipment)
  );

  useEffect(() => {
    setValues(shipmentToFormValues(shipment));
  }, [shipment]);

  const setField = <K extends keyof UpdateShipmentFormValues>(
    key: K,
    value: UpdateShipmentFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateShipment(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    >
      <fieldset disabled={saving} className="space-y-4">
        <Field label="Pickup location" error={fieldErrors.pickupLocation}>
          <TextArea
            placeholder="Building 4, Yiwu International Trade City, Zhejiang"
            value={values.pickupLocation}
            onChange={(event) => setField("pickupLocation", event.target.value)}
          />
        </Field>
        <Field label="Destination notes" error={fieldErrors.destinationDescription}>
          <TextArea
            placeholder="Deliver to Warehouse B, Door 3. Contact store manager on arrival."
            value={values.destinationDescription}
            onChange={(event) => setField("destinationDescription", event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Destination country" error={fieldErrors.destinationCountry}>
            <TextInput
              placeholder="Germany"
              value={values.destinationCountry}
              onChange={(event) => setField("destinationCountry", event.target.value)}
            />
          </Field>
          <Field label="City" error={fieldErrors.city}>
            <TextInput
              placeholder="Berlin"
              value={values.city}
              onChange={(event) => setField("city", event.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Weight" error={fieldErrors.weight}>
            <TextInput
              placeholder="250 kg"
              value={values.weight}
              onChange={(event) => setField("weight", event.target.value)}
            />
            <p className="text-xs text-slate-400">
              Use a string with the unit, e.g. 250 kg.
            </p>
          </Field>
          <Field label="Volume (m³)" error={fieldErrors.volumeM3}>
            <TextInput
              placeholder="4.5"
              value={values.volumeM3}
              onChange={(event) => setField("volumeM3", event.target.value)}
            />
            <p className="text-xs text-slate-400">
              Saved as a decimal string, e.g. 4.5.
            </p>
          </Field>
        </div>
        <Field label="Shipping method" error={fieldErrors.method}>
          <SelectInput
            value={values.method}
            onChange={(event) =>
              setField("method", event.target.value as ShipmentMethodValue)
            }
          >
            {SHIPMENT_METHOD_OPTIONS.map((option) => (
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
          {saving ? "Updating Shipment..." : "Save shipment"}
        </ActionButton>
      </div>
    </form>
  );
}
