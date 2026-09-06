import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { BlogPost } from "./types";
import {
  BLOGS_INVALIDATE_EVENT,
  BlogRequestError,
  asBlogId,
  fetchBlog,
  isPreviewAccessToken,
} from "./api";

export function useBlogDetail(id: string | undefined, options?: { publicFeed?: boolean }) {
  const navigate = useNavigate();
  const publicFeed = options?.publicFeed === true;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const blogId = asBlogId(id);
    if (blogId === undefined) {
      setBlog(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchBlog(blogId);
      setBlog(payload);
    } catch (cause) {
      setBlog(null);

      if (cause instanceof BlogRequestError && cause.status === 401) {
        if (publicFeed || isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load this blog post.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof BlogRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error ? cause.message : "The server could not load this blog post.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, publicFeed]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(BLOGS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(BLOGS_INVALIDATE_EVENT, refresh);
  }, []);

  return {
    blog,
    loading,
    notFound,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
