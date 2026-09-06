import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, TextArea, TextInput } from "../components/FormField";
import type { ProjectFormValues, ProjectRecord } from "./types";
import { asProjectId, projectToFormValues } from "./api";
import { useUpdateProject } from "./useUpdateProject";

interface EditProjectFormProps {
  project: ProjectRecord;
  onCancel: () => void;
  onSaved: (updated: ProjectRecord) => void;
}

export default function EditProjectForm({
  project,
  onCancel,
  onSaved,
}: EditProjectFormProps) {
  const projectId = asProjectId(project.id) ?? 0;
  const { updateProject, saving, notFound, fieldErrors } = useUpdateProject(projectId);
  const [values, setValues] = useState<ProjectFormValues>(() =>
    projectToFormValues(project)
  );

  useEffect(() => {
    setValues(projectToFormValues(project));
  }, [project]);

  const setField = <K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateProject(values);
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

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating Project...
            </span>
          ) : (
            "Save changes"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
