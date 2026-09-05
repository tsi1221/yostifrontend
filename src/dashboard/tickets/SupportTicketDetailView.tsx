import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import {
  formatTicketLabel,
  formatTicketStatus,
  formatTicketUrgency,
  isClosedTicketStatus,
  isHighTicketUrgency,
  isHttpUrl,
  isLowTicketUrgency,
  isMediumTicketUrgency,
  isOpenTicketStatus,
  isResolvedTicketStatus,
} from "./ticketsService";
import { useSupportTicketDetail } from "./useSupportTicketDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const label = formatTicketStatus(status);

  if (isOpenTicketStatus(status)) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        {label}
      </span>
    );
  }

  if (isResolvedTicketStatus(status)) {
    return (
      <span className="inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
        {label}
      </span>
    );
  }

  if (isClosedTicketStatus(status)) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#0F3952]/10 px-3 py-1 text-xs font-semibold text-[#0F3952]">
      {label}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const label = formatTicketUrgency(urgency);

  if (isHighTicketUrgency(urgency)) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        {label}
      </span>
    );
  }

  if (isMediumTicketUrgency(urgency)) {
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        {label}
      </span>
    );
  }

  if (isLowTicketUrgency(urgency)) {
    return (
      <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#FDC700]/20 px-3 py-1 text-xs font-semibold text-[#0F3952]">
      {label}
    </span>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </h2>
      <div className="mt-3 text-xl font-semibold text-[#0F3952]">{children}</div>
    </section>
  );
}

export default function SupportTicketDetailView() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/supports`;
  const { ticket, loading, notFound, serverError, retry } =
    useSupportTicketDetail(ticketId);

  const goBack = () => navigate(listPath);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton tone="ghost" onClick={goBack}>
          Back to list
        </ActionButton>
      </div>

      {loading ? <DetailSkeleton /> : null}

      {!loading && notFound ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Support ticket not found
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This support ticket could not be found or has been removed.
          </p>
          <ActionButton className="mt-5" onClick={goBack}>
            Back to list
          </ActionButton>
        </section>
      ) : null}

      {!loading && !notFound && serverError ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Unable to load support ticket
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Retry
          </ActionButton>
        </section>
      ) : null}

      {!loading && ticket ? (
        <div className="space-y-4">
          <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
              Support ticket
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold md:text-4xl">{ticket.title || "—"}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <TicketStatusBadge status={ticket.status} />
                <UrgencyBadge urgency={ticket.urgency} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard label="Order reference">{ticket.orderReference || "—"}</InfoCard>
            <InfoCard label="Issue type">
              {formatTicketLabel(ticket.issuesType)}
            </InfoCard>
            <InfoCard label="Resolution requested">
              {formatTicketLabel(ticket.resolutionToRequest)}
            </InfoCard>
            <InfoCard label="Attachment">
              {ticket.attachment && isHttpUrl(ticket.attachment) ? (
                <a
                  href={ticket.attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 break-all text-lg font-semibold text-[#0F3952] underline decoration-[#FDC700] underline-offset-4 hover:text-[#FDC700]"
                >
                  Open attachment
                  <ExternalLink size={18} />
                </a>
              ) : (
                ticket.attachment || "—"
              )}
            </InfoCard>
          </div>

          <p className="text-xs text-slate-400">
            Ticket ID {ticket.id} · User ID {ticket.userId || "—"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
