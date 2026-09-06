import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { BlogFieldErrors, BlogFormValues, BlogPost } from "./types";
import {
  BLOG_NOT_FOUND_MESSAGE,
  BLOG_TITLE_EXISTS_MESSAGE,
  BlogRequestError,
  formValuesToPayload,
  isPreviewAccessToken,
  patchBlog,
  validateBlogForm,
} from "./api";

export function useUpdateBlog(id: number) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BlogFieldErrors>({});

  const updateBlog = async (values: BlogFormValues): Promise<BlogPost | null> => {
    const clientErrors = validateBlogForm(values);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return null;
    }

    setSaving(true);
    setNotFound(null);
    setFieldErrors({});

    try {
      const updated = await patchBlog(id, formValuesToPayload(values));
      message.success("Blog post updated successfully.");
      return updated;
    } catch (cause) {
      if (cause instanceof BlogRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? {});
        message.error(cause.message);
        return null;
      }

      if (cause instanceof BlogRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to update this blog post.");
          return null;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return null;
      }

      if (cause instanceof BlogRequestError && cause.status === 404) {
        setNotFound(BLOG_NOT_FOUND_MESSAGE);
        message.warning(BLOG_NOT_FOUND_MESSAGE);
        return null;
      }

      if (cause instanceof BlogRequestError && cause.status === 409) {
        setFieldErrors({ title: cause.fields?.title || BLOG_TITLE_EXISTS_MESSAGE });
        return null;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not update blog post."
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { updateBlog, saving, notFound, fieldErrors };
}
