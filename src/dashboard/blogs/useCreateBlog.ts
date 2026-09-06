import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { BlogFieldErrors, BlogFormValues, BlogPost } from "./types";
import {
  BLOG_TITLE_EXISTS_MESSAGE,
  BlogRequestError,
  createBlog,
  formValuesToPayload,
  isPreviewAccessToken,
  validateBlogForm,
} from "./api";

export function useCreateBlog() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BlogFieldErrors>({});

  const submitBlog = async (values: BlogFormValues): Promise<BlogPost | null> => {
    const clientErrors = validateBlogForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setConflict(null);
    setAuthError(null);
    setFieldErrors({});

    try {
      const created = await createBlog(formValuesToPayload(values));
      message.success(created.message);
      return created.record;
    } catch (cause) {
      if (cause instanceof BlogRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof BlogRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          const previewMessage = "Sign in with a live account to create a blog post.";
          setAuthError(previewMessage);
          message.error(previewMessage);
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof BlogRequestError && cause.status === 409) {
        setConflict(cause.message);
        setFieldErrors({ title: cause.fields?.title || BLOG_TITLE_EXISTS_MESSAGE });
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not create blog post."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { submitBlog, saving, conflict, authError, fieldErrors };
}
