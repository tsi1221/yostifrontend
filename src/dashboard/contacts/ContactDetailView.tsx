import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import { CONTACT_NOT_FOUND_MESSAGE, asContactId, whatsappHref } from "./api";
import DeleteContactDialog from "./DeleteContactDialog";
import EditContactForm from "./EditContactForm";
import { useContactDetail } from "./useContactDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function ContactDetailView() {
  const navigate = useNavigate();
  const { contactId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/contacts`;
  const { contact, loading, notFound, serverError, retry } = useContactDetail(contactId);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const editing = searchParams.get("edit") === "1";
  const whatsapp = contact ? whatsappHref(contact.phoneWhatsapp) : "";

  return (
    <div>
      <PageHeader
        title={contact?.fullname || "Contact submission"}
        description="Review the visitor message, then edit or delete it."
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
              Back to inbox
            </ActionButton>
            {contact ? (
              <>
                <ActionButton onClick={() => setSearchParams({ edit: "1" })}>
                  Edit
                </ActionButton>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                  aria-label="Delete contact"
                  onClick={() => {
                    const id = asContactId(contact.id);
                    if (id !== undefined) {
                      setPendingDelete(id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : null}
          </div>
        }
      />

      {loading ? <DetailSkeleton /> : null}

      {!loading && notFound ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">{CONTACT_NOT_FOUND_MESSAGE}</p>
          <div className="mt-4">
            <ActionButton onClick={() => navigate(listPath)}>Back to inbox</ActionButton>
          </div>
        </div>
      ) : null}

      {!loading && serverError && !notFound ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </div>
      ) : null}

      {!loading && contact ? (
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Message #{contact.id}
          </p>
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Full name
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#0F3952]">{contact.fullname}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Topic
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{contact.topic || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Email
              </dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm font-medium text-[#0F3952] underline"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                WhatsApp
              </dt>
              <dd className="mt-1">
                {whatsapp ? (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#0F3952] underline"
                  >
                    {contact.phoneWhatsapp}
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="text-sm text-slate-500">{contact.phoneWhatsapp || "—"}</span>
                )}
              </dd>
            </div>
          </dl>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Details
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {contact.details}
            </p>
          </div>
        </article>
      ) : null}

      <SideDrawer
        open={Boolean(contact) && editing}
        title={contact ? `Edit contact #${contact.id}` : "Edit contact"}
        description="Update the visitor submission details."
        onClose={() => setSearchParams({})}
      >
        {contact ? (
          <EditContactForm
            contact={contact}
            onCancel={() => setSearchParams({})}
            onSaved={() => setSearchParams({})}
          />
        ) : null}
      </SideDrawer>

      <DeleteContactDialog
        open={pendingDelete !== null}
        contactId={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => setPendingDelete(null)}
      />
    </div>
  );
}
