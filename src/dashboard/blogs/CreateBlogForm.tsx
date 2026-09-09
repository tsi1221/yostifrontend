import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { Field, TextArea, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import type { UploadedFile } from "../files/types";
import LogoImageUpload from "../services/LogoImageUpload";
import type { BlogFormValues } from "./types";
import { EMPTY_BLOG_FORM } from "./types";
import { useCreateBlog } from "./useCreateBlog";

export default function CreateBlogForm() {
  const navigate = useNavigate();
  useDashboard();
  const listPath = dashboardPath("blogs");
  const { submitBlog, saving, conflict, authError, fieldErrors } =
    useCreateBlog();
  const [values, setValues] = useState<BlogFormValues>(EMPTY_BLOG_FORM);
  const [uploadedLogo, setUploadedLogo] = useState<UploadedFile | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const setField = <K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Create blog post"
        description="Publish a title, image, and article details."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to blogs
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          if (uploadingLogo) {
            return;
          }
          const created = await submitBlog(values);
          if (created) {
            setValues(EMPTY_BLOG_FORM);
            setUploadedLogo(null);
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

        <fieldset disabled={saving || uploadingLogo} className="space-y-4">
          <Field label="Title" error={fieldErrors.title}>
            <TextInput
              placeholder="How Yosti sources factories in Shenzhen"
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
            />
          </Field>
          <Field label="Blog image">
            <LogoImageUpload
              value={uploadedLogo}
              description="Blog image"
              inputId="blog-logo-upload"
              disabled={saving || uploadingLogo}
              error={fieldErrors.logo}
              onUploadingChange={setUploadingLogo}
              onChange={(file) => {
                setUploadedLogo(file);
                setField("logo", file?.url ?? "");
              }}
            />
          </Field>
          <Field label="Details" error={fieldErrors.details}>
            <TextArea
              placeholder="Write the article body..."
              value={values.details}
              onChange={(event) => setField("details", event.target.value)}
            />
          </Field>
        </fieldset>

        <div className="flex justify-end gap-2">
          <ActionButton
            tone="ghost"
            disabled={saving || uploadingLogo}
            onClick={() => navigate(listPath)}
          >
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={saving || uploadingLogo}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating Post...
              </span>
            ) : (
              "Publish post"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
