import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { CheckboxRow, Field, SelectInput, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { ServiceFormValues, ServiceTierValue } from "./types";
import { EMPTY_SERVICE_FORM, SERVICE_TIER_OPTIONS } from "./types";
import { useCreateService } from "./useCreateService";

export default function CreateServiceForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/services`;
  const { submitService, saving, conflict, authError, fieldErrors } =
    useCreateService();
  const [values, setValues] = useState<ServiceFormValues>(EMPTY_SERVICE_FORM);

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
      return {
        ...current,
        features: next.length > 0 ? next : [""],
      };
    });
  };

  return (
    <div>
      <PageHeader
        title="Create Service"
        description="Publish a catalog offering with a logo, tier, 24/7 support flag, and feature list."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to services
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitService(values);
          if (created) {
            setValues(EMPTY_SERVICE_FORM);
            navigate(listPath, { replace: true });
          }
        }}
      >
        {conflict ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {conflict}
          </div>
        ) : null}

        {authError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p>{authError}</p>
            <ActionButton type="submit" disabled={saving}>
              Retry
            </ActionButton>
          </div>
        ) : null}

        <fieldset disabled={saving} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Title" error={fieldErrors.title}>
              <TextInput
                placeholder="End-to-End Client Handling"
                value={values.title}
                onChange={(event) => setField("title", event.target.value)}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Logo" error={fieldErrors.logo}>
              <TextInput
                type="url"
                placeholder="https://cdn.yosti.com/services/client-handling.svg"
                value={values.logo}
                onChange={(event) => setField("logo", event.target.value)}
              />
              <p className="text-xs text-slate-400">
                Must be a full http(s) URL. File uploads are not sent to storage.
              </p>
            </Field>
          </div>
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
          <div className="space-y-1.5 md:col-span-2">
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
            ) : (
              <p className="text-xs text-slate-400">
                Blank rows are dropped before submit. At least one feature is required.
              </p>
            )}
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
                Creating Service...
              </span>
            ) : (
              "Create service"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
