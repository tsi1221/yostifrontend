import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { BlogDeletionPhase } from "./types";
import {
  BLOG_NOT_FOUND_MESSAGE,
  BlogRequestError,
  deleteBlog,
  invalidateBlogsCache,
  isPreviewAccessToken,
} from "./api";

export function useDeleteBlog() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const [phase, setPhase] = useState<BlogDeletionPhase>("idle");
  const listPath = `/${ROLE_SLUG[role]}/blogs`;

  const removeBlog = async (id: number) => {
    setPhase("deleting");

    try {
      const successMessage = await deleteBlog(id);
      message.success(successMessage);
      invalidateBlogsCache();
      setPhase("idle");
      navigate(listPath, { replace: true });
      return true;
    } catch (cause) {
      if (cause instanceof BlogRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          message.error("Sign in with a live account to delete this blog post.");
          setPhase("confirming");
          return false;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return false;
      }

      if (cause instanceof BlogRequestError && cause.status === 404) {
        message.warning(BLOG_NOT_FOUND_MESSAGE);
        setPhase("confirming");
        return false;
      }

      message.error(
        cause instanceof Error
          ? cause.message
          : "Server error occurred. Could not delete blog post."
      );
      setPhase("confirming");
      return false;
    }
  };

  return {
    removeBlog,
    phase,
    deleting: phase === "deleting",
  };
}
