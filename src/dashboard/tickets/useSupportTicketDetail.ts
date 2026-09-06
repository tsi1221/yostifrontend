import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { TicketRecord } from "./types";
import {
  TicketsRequestError,
  fetchSupportTicket,
  isPreviewAccessToken,
  parseSupportTicketId,
} from "./ticketsService";

export function useSupportTicketDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    const ticketId = parseSupportTicketId(id);
    if (ticketId === undefined) {
      setTicket(null);
      setLoading(false);
      setNotFound(true);
      setServerError(null);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setServerError(null);

    try {
      const payload = await fetchSupportTicket(ticketId);
      setTicket(payload);
    } catch (cause) {
      setTicket(null);

      if (cause instanceof TicketsRequestError && cause.status === 400) {
        message.error(cause.message);
        setServerError(cause.message);
        return;
      }

      if (cause instanceof TicketsRequestError && cause.status === 401) {
        if (isPreviewAccessToken(getAccessToken())) {
          setServerError("Sign in with a live account to load this support ticket.");
          return;
        }
        clearAuthSession();
        navigate("/login", { replace: true });
        return;
      }

      if (cause instanceof TicketsRequestError && cause.status === 404) {
        setNotFound(true);
        return;
      }

      const text =
        cause instanceof Error
          ? cause.message
          : "The server could not load this support ticket.";
      message.error(text);
      setServerError(text);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  return {
    ticket,
    loading,
    notFound,
    serverError,
    applyTicket: setTicket,
    retry: () => setReloadToken((value) => value + 1),
  };
}
