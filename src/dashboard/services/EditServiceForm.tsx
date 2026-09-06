import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { CheckboxRow, Field, SelectInput, TextInput } from "../components/FormField";
import type { ServiceFormValues, ServiceRecord, ServiceTierValue } from "./types";
import { SERVICE_TIER_OPTIONS } from "./types";
import { asServiceId, serviceToFormValues } from "./servicesService";
import { useUpdateService } from "./useUpdateService";

interface EditServiceFormProps {
  service: ServiceRecord;
  onCancel: () => void;
  onSaved: (updated: ServiceRecord) => void;
}

export default function EditServiceForm({
  service,
  onCancel,
  onSaved,
}: EditServiceFormProps) {
  const serviceId = asServiceId(service.id) ?? 0;
  const { updateService, saving, notFound, fieldErrors } = useUpdateService(serviceId);
  const [values, setValues] = useState<ServiceFormValues>(() => serviceToFormValues(service));

  useEffect(() => {
    setValues(serviceToFormValues(service));
  }, [service]);

  const setField = <K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const setFeature = (index: number, value: string) => {
    setValues((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  const addFeature = () => {
    setValues((current) => ({
      ...current,
      features: [...current.features, ""],
    }));
  };

  const removeFeature = (index: number) => {
    setValues((current) => {
      const next = current.features.filter((_, featureIndex) => featureIndex !== index);
      return { ...current, features: next.length > 0 ? next : [""] };
    });
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateService(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    >
      {notFound ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {notFound}
        </div>
      ) : null}

      <fieldset disabled={saving} className="space-y-4">
        <Field label="Title" error={fieldErrors.title}>
          <TextInput
            placeholder="End-to-End Client Handling"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </Field>
        <Field label="Logo" error={fieldErrors.logo}>
          <TextInput
            type="url"
            placeholder="https://cdn.yosti.com/services/client-handling.svg"
            value={values.logo}
            onChange={(event) => setField("logo", event.target.value)}
          />
        </Field>
        <Field label="Tier" error={fieldErrors.tier}>
          <SelectInput
            value={values.tier}
            onChange={(event) =>
              setField("tier", event.target.value as ServiceTierValue | "")
            }
          >
            <option value="">Select a tier</option>
            {SERVICE_TIER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Support 24/7" error={fieldErrors.support247}>
          <CheckboxRow
            label="Offer 24/7 support"
            checked={values.support247}
            onChange={(checked) => setField("support247", checked)}
          />
        </Field>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Features
          </span>
          <div className="space-y-2">
            {values.features.map((feature, index) => (
              <div key={`feature-${index}`} className="flex items-center gap-2">
                <TextInput
                  placeholder="Register and onboard clients remotely"
                  value={feature}
                  onChange={(event) => setFeature(index, event.target.value)}
                />
                <ActionButton
                  tone="ghost"
                  disabled={values.features.length === 1}
                  onClick={() => removeFeature(index)}
                  aria-label={`Remove feature ${index + 1}`}
                >
                  <X size={16} />
                </ActionButton>
              </div>
            ))}
          </div>
          <ActionButton tone="ghost" onClick={addFeature}>
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Add feature
            </span>
          </ActionButton>
          {fieldErrors.features ? (
            <span className="block text-xs font-medium text-red-600">
              {fieldErrors.features}
            </span>
          ) : null}
        </div>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating Service...
            </span>
          ) : (
            "Save changes"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
