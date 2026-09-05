import { Navigate, useNavigate, useParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
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
  const { request, loading, notFound, serverError, retry } = useRequestDetail(requestId);

  if (role !== "SUPER_ADMIN") {
    return <Navigate to={listPath} replace />;
  }

  const goBack = () => navigate(listPath);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton tone="ghost" onClick={goBack}>
          Back to Requests List
        </ActionButton>
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
    </div>
  );
}
