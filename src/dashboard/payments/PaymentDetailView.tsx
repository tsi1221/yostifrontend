import type { ReactNode } from "react";
import { useState } from "react";
import { CreditCard, PackageSearch, Trash2, Truck, Wallet } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import DeletePaymentDialog from "./DeletePaymentDialog";
import EditPaymentForm from "./EditPaymentForm";
import {
  formatPaymentStatus,
  isCompletedPaymentStatus,
  isFailedOrRefundedPaymentStatus,
  isPendingPaymentStatus,
} from "./paymentsService";
import { usePaymentDetail } from "./usePaymentDetail";

function ReceiptSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const label = formatPaymentStatus(status);

  if (isPendingPaymentStatus(status)) {
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

  if (isCompletedPaymentStatus(status)) {
    return (
      <span className="inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
        {label}
      </span>
    );
  }

  if (isFailedOrRefundedPaymentStatus(status)) {
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

function methodIcon(method: string): ReactNode {
  const key = method.trim().toLowerCase();
  if (key === "alipay") {
    return <Wallet size={22} />;
  }
  return <CreditCard size={22} />;
}

function serviceIcon(service: string): ReactNode {
  const key = service.trim().toLowerCase();
  if (key === "sourcing") {
    return <PackageSearch size={22} />;
  }
  return <Truck size={22} />;
}

function ReceiptCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDC700]/20 text-[#0F3952]">
          {icon}
        </span>
        <p className="text-xl font-semibold text-[#0F3952]">{value || "—"}</p>
      </div>
    </section>
  );
}

export default function PaymentDetailView() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/payments`;
  const [searchParams, setSearchParams] = useSearchParams();
  const { payment, loading, notFound, serverError, applyPayment, retry } =
    usePaymentDetail(paymentId);
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
          Back to payments list
        </ActionButton>
        {payment ? (
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(true)}>Edit payment</ActionButton>
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

      {loading ? <ReceiptSkeleton /> : null}

      {!loading && notFound ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Transaction not found
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This transaction record could not be found or does not exist,
          </p>
          <ActionButton className="mt-5" onClick={goBack}>
            Back to Billing History
          </ActionButton>
        </section>
      ) : null}

      {!loading && !notFound && serverError ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Unable to load payment details
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Retry
          </ActionButton>
        </section>
      ) : null}

      {!loading && payment ? (
        <div className="space-y-4">
          <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
              Payment receipt
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold md:text-4xl">
                Payment ID {payment.id}
              </h1>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ReceiptCard
              label="Service"
              value={payment.service}
              icon={serviceIcon(payment.service)}
            />
            <ReceiptCard
              label="Payment method"
              value={payment.method}
              icon={methodIcon(payment.method)}
            />
          </div>

          <p className="text-xs text-slate-400">User ID {payment.userId || "—"}</p>
        </div>
      ) : null}

      <SideDrawer
        open={Boolean(editing && payment)}
        title={payment ? `Edit payment #${payment.id}` : "Edit payment"}
        description="Update service, method, and status. Changes are sent with PATCH."
        onClose={closeEditor}
      >
        {payment ? (
          <EditPaymentForm
            payment={payment}
            onCancel={closeEditor}
            onSaved={(updated) => {
              applyPayment(updated);
              closeEditor();
            }}
          />
        ) : null}
      </SideDrawer>

      <DeletePaymentDialog
        open={Boolean(confirmDelete && payment)}
        paymentId={payment?.id ?? null}
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
