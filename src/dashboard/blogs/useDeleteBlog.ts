import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { expireSession, FORBIDDEN_MESSAGE } from "../auth/sessionExpiry";

import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import type { BlogDeletionPhase } from "./types";
import {
  BLOG_NOT_FOUND_MESSAGE,
  BlogRequestError,
  deleteBlog,
  invalidateBlogsCache,
} from "./api";

export function useDeleteBlog() {
  const navigate = useNavigate();
  useDashboard();
  const [phase, setPhase] = useState<BlogDeletionPhase>("idle");
  const listPath = dashboardPath("blogs");

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
        expireSession(navigate);
        return false;
      }

      if (cause instanceof BlogRequestError && cause.status === 403) {
        message.error(FORBIDDEN_MESSAGE);
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
          : "Server error occurred. Could not delete blog post.",
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
