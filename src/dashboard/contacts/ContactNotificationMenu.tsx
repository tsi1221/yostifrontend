import { useEffect, useRef, useState } from "react";
import { Bell, Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import SideDrawer from "../components/SideDrawer";
import { snippet, whatsappHref } from "./api";
import { useContactDetail } from "./useContactDetail";
import type { ContactRecord } from "./types";

interface ContactNotificationMenuProps {
  contacts: ContactRecord[];
  contactCount: number;
  loading: boolean;
  serverError: string | null;
  retry: () => void;
  onSeen: (contactId: number) => void;
}

export default function ContactNotificationMenu({
  contacts,
  contactCount,
  loading,
  serverError,
  retry,
  onSeen,
}: ContactNotificationMenuProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const markedDetailId = useRef<number | null>(null);
  const detail = useContactDetail(
    selectedId === null ? undefined : String(selectedId),
  );

  const closeDetail = () => setSelectedId(null);
  const whatsapp = detail.contact ? whatsappHref(detail.contact.phoneWhatsapp) : "";
  const badgeCount = contactCount > 99 ? "99+" : String(contactCount);

  useEffect(() => {
    if (
      selectedId !== null &&
      !detail.loading &&
      detail.contact?.id === selectedId &&
      markedDetailId.current !== selectedId
    ) {
      markedDetailId.current = selectedId;
      onSeen(selectedId);
    }
  }, [detail.contact, detail.loading, onSeen, selectedId]);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#FDC700] focus:ring-offset-2"
          aria-label={
            contactCount > 0
              ? `Contact submissions: ${contactCount}`
              : "Contact submissions"
          }
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <Bell size={18} />
          {contactCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white">
              {badgeCount}
            </span>
          ) : null}
        </button>

        {open ? (
          <section className="absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <header className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-[#0F3952]">
                Contact submissions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {contactCount > 0
                  ? `${contactCount} new contact submissions`
                  : "No new contact submissions"}
              </p>
            </header>

            {loading ? (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Loading contact submissions...
              </div>
            ) : null}

            {!loading && serverError ? (
              <div className="space-y-3 px-4 py-5 text-sm text-slate-600">
                <p>{serverError}</p>
                <ActionButton tone="ghost" onClick={retry}>
                  Retry
                </ActionButton>
              </div>
            ) : null}

            {!loading && !serverError && contacts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                No new contact messages.
              </p>
            ) : null}

            {!loading && !serverError && contacts.length > 0 ? (
              <ul className="max-h-[min(28rem,65vh)] overflow-y-auto divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <li key={contact.id} className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F3952]">
                        {contact.fullname || "Unnamed contact"}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                        {contact.topic || "No topic"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {contact.email || "No email"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {snippet(contact.details, 100) || "No details"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mt-2 text-xs font-semibold text-[#0F3952] underline underline-offset-2 hover:text-[#0F3952]/70"
                      onClick={() => {
                        setOpen(false);
                        setSelectedId(contact.id);
                      }}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>

      <SideDrawer
        open={selectedId !== null}
        title={detail.contact?.fullname || "Contact details"}
        description="Contact submission"
        onClose={closeDetail}
      >
        {detail.loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading contact details...
          </div>
        ) : null}

        {!detail.loading && detail.notFound ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            This contact submission could not be found.
          </div>
        ) : null}

        {!detail.loading && detail.serverError && !detail.notFound ? (
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>{detail.serverError}</p>
            <ActionButton tone="ghost" onClick={detail.retry}>
              Retry
            </ActionButton>
          </div>
        ) : null}

        {!detail.loading && detail.contact ? (
          <dl className="space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Full name
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#0F3952]">
                {detail.contact.fullname || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                WhatsApp / Phone
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#0F3952] underline"
                  >
                    {detail.contact.phoneWhatsapp || "—"}
                  </a>
                ) : (
                  detail.contact.phoneWhatsapp || "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Email
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {detail.contact.email ? (
                  <a
                    href={`mailto:${detail.contact.email}`}
                    className="font-medium text-[#0F3952] underline"
                  >
                    {detail.contact.email}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Topic
              </dt>
              <dd className="mt-1 text-sm text-slate-700">
                {detail.contact.topic || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Message
              </dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {detail.contact.details || "—"}
              </dd>
            </div>
          </dl>
        ) : null}
      </SideDrawer>
    </>
  );
}