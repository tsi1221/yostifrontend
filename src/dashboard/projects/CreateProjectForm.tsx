import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { Field, TextArea, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { ProjectFormValues } from "./types";
import { EMPTY_PROJECT_FORM } from "./types";
import { useCreateProject } from "./useCreateProject";

export default function CreateProjectForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/projects`;
  const { submitProject, saving, conflict, authError, fieldErrors } = useCreateProject();
  const [values, setValues] = useState<ProjectFormValues>(EMPTY_PROJECT_FORM);

  const setField = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Create project"
        description="Publish a title, image URL, and project details."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to projects
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitProject(values);
          if (created) {
            setValues(EMPTY_PROJECT_FORM);
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

        <fieldset disabled={saving} className="space-y-4">
          <Field label="Title" error={fieldErrors.title}>
            <TextInput
              placeholder="Shenzhen factory audit program"
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="Image" error={fieldErrors.image}>
            <TextInput
              type="url"
              placeholder="https://cdn.yosti.com/projects/shenzhen-audit.jpg"
              value={values.image}
              onChange={(event) => setField("image", event.target.value)}
            />
          </Field>
          <Field label="Details" error={fieldErrors.details}>
            <TextArea
              placeholder="Describe the project scope, outcomes, and partners..."
              value={values.details}
              onChange={(event) => setField("details", event.target.value)}
            />
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
                Creating Project...
              </span>
            ) : (
              "Publish project"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
