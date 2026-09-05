import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import SideDrawer from "../components/SideDrawer";
import { BADGE_TONE_CLASS, getStatusTone } from "../statusStyles";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import DeleteInspectionDialog from "./DeleteInspectionDialog";
import EditInspectionForm from "./EditInspectionForm";
import { formatInspectionDate, formatInspectionType } from "./inspectionsService";
import { useInspectionDetail } from "./useInspectionDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const tone = getStatusTone(type) ?? "navy";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${BADGE_TONE_CLASS[tone]}`}
    >
      {formatInspectionType(type)}
    </span>
  );
}

export default function InspectionDetailView() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/quality-control`;
  const [searchParams, setSearchParams] = useSearchParams();
  const { inspection, loading, notFound, serverError, applyInspection, retry } =
    useInspectionDetail(inspectionId);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goBack = () => navigate(listPath);
  const closeEditor = () => {
    setEditing(false);
    if (searchParams.get("edit") === "1") {
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton tone="ghost" onClick={goBack}>
          Back to List
        </ActionButton>
        {inspection ? (
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(true)}>Edit inspection</ActionButton>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {loading ? <DetailSkeleton /> : null}

      {!loading && notFound ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Inspection request not found
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This inspection request could not be found or has been removed.
          </p>
          <ActionButton className="mt-5" onClick={goBack}>
            Back to List
          </ActionButton>
        </section>
      ) : null}

      {!loading && !notFound && serverError ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Unable to load inspection details
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Retry Connection
          </ActionButton>
        </section>
      ) : null}

      {!loading && inspection ? (
        <div className="space-y-4">
          <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
              Inspection request
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold">{inspection.productType || "—"}</h1>
              <TypeBadge type={inspection.type} />
            </div>
            <p className="mt-2 text-xs text-white/60">ID {inspection.id}</p>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Inspection Profile
              </h2>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-xs text-slate-500">Inspection ID</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#0F3952]">
                    {inspection.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">User ID</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#0F3952]">
                    {inspection.userId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Supplier ID</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#0F3952]">
                    {inspection.supplierId}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Schedule
              </h2>
              <div className="mt-4 rounded-xl bg-[#FDC700]/20 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0F3952]">
                  Inspection date
                </p>
                <p className="mt-1 text-lg font-bold text-[#0F3952]">
                  {formatInspectionDate(inspection.date)}
                </p>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Media
            </h2>
            {inspection.photoVideoRequired ? (
              <div className="mt-4 rounded-xl border border-[#FDC700] bg-[#FDC700]/15 px-4 py-4">
                <p className="text-lg font-semibold text-[#0F3952]">
                  📸 Photo & Video Proof Required
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  This booking requires photo and video evidence during the inspection.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-lg font-semibold text-[#0F3952]">
                  Standard Verification
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Photo and video proof is optional for this inspection.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}

      <SideDrawer
        open={Boolean(editing && inspection)}
        title="Edit inspection"
        description="Update booking details and save. Changes are sent with PATCH."
        onClose={closeEditor}
      >
        {inspection ? (
          <EditInspectionForm
            inspection={inspection}
            onCancel={closeEditor}
            onSaved={(updated) => {
              applyInspection(updated);
              closeEditor();
            }}
          />
        ) : null}
      </SideDrawer>

      <DeleteInspectionDialog
        open={Boolean(confirmDelete && inspection)}
        inspectionId={inspection?.id ?? null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => {
          setConfirmDelete(false);
          closeEditor();
          navigate(listPath, { replace: true });
        }}
      />
    </div>
  );
}
