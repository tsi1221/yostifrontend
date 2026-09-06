import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { ContactRecord } from "./types";
import {
  CONTACTS_INVALIDATE_EVENT,
  ContactRequestError,
  asContactId,
  fetchContact,
  isPreviewAccessToken,
} from "./api";

export function useContactDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [contact, setContact] = useState<ContactRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const contactId = asContactId(id);
    if (contactId === undefined) {
      setContact(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchContact(contactId);
      setContact(payload);
    } catch (cause) {
      setContact(null);

      if (cause instanceof ContactRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load this contact.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof ContactRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error
          ? cause.message
          : "The server could not load this contact submission.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    const refresh = () => setReloadToken((value) => value + 1);
    window.addEventListener(CONTACTS_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(CONTACTS_INVALIDATE_EVENT, refresh);
  }, []);

  return {
    contact,
    loading,
    notFound,
    serverError,
    retry: () => setReloadToken((value) => value + 1),
  };
}
