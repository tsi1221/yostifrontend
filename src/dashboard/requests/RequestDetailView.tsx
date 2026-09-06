import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { isSuperAdminSession } from "../auth/superAdminAccess";
import ActionButton from "../components/ActionButton";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import DeleteRequestDialog from "./DeleteRequestDialog";
import EditRequestForm from "./EditRequestForm";
import {
  formatDeadline,
  formatMoney,
  formatTimestamp,
  requestStatusClass,
} from "./format";
import { useRequestDetail } from "./useRequestDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function RequestDetailView() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/sourcing`;
  const [searchParams, setSearchParams] = useSearchParams();
  const { request, loading, notFound, serverError, applyRequest, retry } =
    useRequestDetail(requestId);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (role !== "SUPER_ADMIN" && !isSuperAdminSession()) {
    return <Navigate to={listPath} replace />;
  }

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
          Back to Requests List
        </ActionButton>
        {request ? (
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(true)}>Edit request</ActionButton>
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
          <p className="text-lg font-semibold text-[#0F3952]">Request not found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Request not found. It may have been deleted or the ID is incorrect.
          </p>
          <ActionButton className="mt-5" onClick={goBack}>
            Go Back
          </ActionButton>
        </section>
      ) : null}

      {!loading && !notFound && serverError ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Unable to load request details
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Retry Connection
          </ActionButton>
        </section>
      ) : null}

      {!loading && request ? (
        <div className="space-y-4">
          <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
              Request details
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold">{request.productName}</h1>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${requestStatusClass(request.status)}`}
              >
                {request.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/60">ID {request.id}</p>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Procurement specs
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-slate-500">Quantity</dt>
                  <dd className="mt-1 text-2xl font-semibold text-[#0F3952]">
                    {request.quantity.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Target price</dt>
                  <dd className="mt-1 text-2xl font-semibold text-[#0F3952]">
                    {formatMoney(request.targetPrice)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Logistics
              </h2>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-xs text-slate-500">Supplier region</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#0F3952]">
                    {request.supplierRegion}
                  </dd>
                </div>
                <div className="rounded-xl bg-[#FDC700]/20 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0F3952]">
                    Deadline
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-[#0F3952]">
                    {formatDeadline(request.deadline)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Full description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {request.description || "No description provided."}
            </p>
          </section>

          <p className="text-xs text-slate-400">
            Created {formatTimestamp(request.createdAt)} · Updated{" "}
            {formatTimestamp(request.updatedAt)}
          </p>
        </div>
      ) : null}

      <SideDrawer
        open={Boolean(editing && request)}
        title="Edit request"
        description="Update fields and save. Changes are sent with PATCH."
        onClose={closeEditor}
      >
        {request ? (
          <EditRequestForm
            request={request}
            onCancel={closeEditor}
            onSaved={(updated) => {
              applyRequest(updated);
              closeEditor();
            }}
          />
        ) : null}
      </SideDrawer>

      <DeleteRequestDialog
        open={Boolean(confirmDelete && request)}
        requestId={request?.id ?? ""}
        productName={request?.productName ?? "this request"}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => {
          setConfirmDelete(false);
          navigate(listPath, { replace: true });
        }}
      />
    </div>
  );
}
