import type { ReactNode } from "react";
import { CreditCard, PackageSearch, Truck, Wallet } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
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
  const { payment, loading, notFound, serverError, retry } =
    usePaymentDetail(paymentId);

  const goBack = () => navigate(listPath);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton tone="ghost" onClick={goBack}>
          Back to payments list
        </ActionButton>
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
    </div>
  );
}
