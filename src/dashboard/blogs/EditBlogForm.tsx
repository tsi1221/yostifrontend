import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, TextArea, TextInput } from "../components/FormField";
import type { BlogFormValues, BlogPost } from "./types";
import { asBlogId, blogToFormValues } from "./api";
import { useUpdateBlog } from "./useUpdateBlog";

interface EditBlogFormProps {
  blog: BlogPost;
  onCancel: () => void;
  onSaved: (updated: BlogPost) => void;
}

export default function EditBlogForm({ blog, onCancel, onSaved }: EditBlogFormProps) {
  const blogId = asBlogId(blog.id) ?? 0;
  const { updateBlog, saving, notFound, fieldErrors } = useUpdateBlog(blogId);
  const [values, setValues] = useState<BlogFormValues>(() => blogToFormValues(blog));

  useEffect(() => {
    setValues(blogToFormValues(blog));
  }, [blog]);

  const setField = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateBlog(values);
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
            placeholder="How Yosti sources factories in Shenzhen"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
          />
        </Field>
        <Field label="Logo" error={fieldErrors.logo}>
          <TextInput
            type="url"
            placeholder="https://cdn.yosti.com/blogs/shenzhen-desk.svg"
            value={values.logo}
            onChange={(event) => setField("logo", event.target.value)}
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

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating Post...
            </span>
          ) : (
            "Save changes"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
