import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import { asContactId, snippet } from "./api";
import ContactEmptyState from "./ContactEmptyState";
import DeleteContactDialog from "./DeleteContactDialog";
import EditContactForm from "./EditContactForm";
import type { ContactRecord } from "./types";
import { useContactsList } from "./useContactsList";

const COLUMNS = 6;

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }, (_, row) => (
        <tr key={`skeleton-${row}`}>
          {Array.from({ length: COLUMNS }, (_, cell) => (
            <td key={cell} className="px-4 py-3">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ContactsTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    contacts,
    meta,
    loading,
    serverError,
    retry,
  } = useContactsList();
  const [editing, setEditing] = useState<ContactRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const detailPath = (id: number) => `/${ROLE_SLUG[role]}/contacts/${id}`;
  const filtersEmpty =
    !filters.search.trim() &&
    !filters.fullname.trim() &&
    !filters.email.trim() &&
    !filters.topic.trim();
  const showInboxEmpty = !loading && !serverError && meta.total === 0 && filtersEmpty;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search messages"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Full name
          </span>
          <TextInput
            value={filters.fullname}
            onChange={(event) => setFilter("fullname", event.target.value)}
            placeholder="Filter by name"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Email
          </span>
          <TextInput
            value={filters.email}
            onChange={(event) => setFilter("email", event.target.value)}
            placeholder="Filter by email"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Topic
          </span>
          <TextInput
            value={filters.topic}
            onChange={(event) => setFilter("topic", event.target.value)}
            placeholder="Filter by topic"
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      {showInboxEmpty ? (
        <ContactEmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <SkeletonRows /> : null}
                {!loading && contacts.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS} className="px-4 py-10">
                      <ContactEmptyState
                        title="No messages match"
                        description="Try a different name, email, topic, or global search."
                      />
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(detailPath(contact.id))}
                      >
                        <td className="px-4 py-3 font-medium text-[#0F3952]">{contact.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#0F3952]">
                          {contact.fullname}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{contact.email}</td>
                        <td className="px-4 py-3">{contact.topic || "—"}</td>
                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          {snippet(contact.details) || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ActionButton
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditing(contact);
                              }}
                            >
                              Edit
                            </ActionButton>
                            <button
                              type="button"
                              className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                              aria-label={`Delete contact ${contact.id}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                const id = asContactId(contact.id);
                                if (id !== undefined) {
                                  setPendingDelete(id);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {rangeLabel(meta.page, meta.pageSize, meta.total)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <SelectInput
                value={String(filters.pageSize)}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="w-auto"
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </SelectInput>
              <ActionButton
                tone="ghost"
                disabled={meta.page <= 1 || loading}
                onClick={() => setPage(meta.page - 1)}
              >
                Previous
              </ActionButton>
              <span className="px-2 text-sm font-medium text-[#0F3952]">
                {meta.page} / {Math.max(meta.totalPages, 1)}
              </span>
              <ActionButton
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => setPage(meta.page + 1)}
              >
                Next
              </ActionButton>
            </div>
          </footer>
        </div>
      )}

      <SideDrawer
        open={Boolean(editing)}
        title={editing ? `Edit contact #${editing.id}` : "Edit contact"}
        description="Update the visitor submission details."
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditContactForm
            contact={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </SideDrawer>

      <DeleteContactDialog
        open={pendingDelete !== null}
        contactId={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => {
          if (editing && pendingDelete !== null && editing.id === pendingDelete) {
            setEditing(null);
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
