import type { ReactNode } from "react";
import { useState } from "react";
import { CreditCard, Loader2, PackageSearch, Truck, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import type { PaymentFormValues, PaymentMethodValue, PaymentServiceValue } from "./types";
import {
  EMPTY_PAYMENT_FORM,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_SERVICE_OPTIONS,
} from "./types";
import { useCreatePayment } from "./useCreatePayment";

const METHOD_ICONS: Record<PaymentMethodValue, ReactNode> = {
  Card: <CreditCard size={22} />,
  AliPay: <Wallet size={22} />,
};

const SERVICE_ICONS: Record<PaymentServiceValue, ReactNode> = {
  Logistic: <Truck size={20} />,
  Sourcing: <PackageSearch size={20} />,
};

function ChoiceCard({
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
        selected
          ? "border-[#FDC700] bg-[#0F3952] text-white"
          : "border-slate-200 bg-white text-[#0F3952] hover:border-[#0F3952]/40"
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-[#FDC700] text-[#0F3952]" : "bg-[#0F3952]/10 text-[#0F3952]"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className={`mt-0.5 block text-xs ${selected ? "text-white/80" : "text-slate-500"}`}>
          {description}
        </span>
      </span>
    </button>
  );
}

export default function CreatePaymentForm() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/payments`;
  const { submitPayment, saving, conflict, fieldErrors } = useCreatePayment();
  const [values, setValues] = useState<PaymentFormValues>(EMPTY_PAYMENT_FORM);

  const setField = <K extends keyof PaymentFormValues>(
    key: K,
    value: PaymentFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div>
      <PageHeader
        title="Initiate Payment"
        description="Choose a service and method. New records start as Pending."
        actions={
          <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
            Back to payments
          </ActionButton>
        }
      />

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          const created = await submitPayment(values);
          if (created) {
            setValues(EMPTY_PAYMENT_FORM);
            navigate(listPath, { replace: true });
          }
        }}
      >
        {conflict ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {conflict}
          </div>
        ) : null}

        <fieldset disabled={saving} className="space-y-5">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Service
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Service">
              {PAYMENT_SERVICE_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.value}
                  selected={values.service === option.value}
                  title={option.label}
                  description={option.description}
                  icon={SERVICE_ICONS[option.value]}
                  onSelect={() => setField("service", option.value)}
                />
              ))}
            </div>
            {fieldErrors.service ? (
              <span className="text-xs font-medium text-red-600">{fieldErrors.service}</span>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Payment method
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.value}
                  selected={values.method === option.value}
                  title={option.label}
                  description={option.description}
                  icon={METHOD_ICONS[option.value]}
                  onSelect={() => setField("method", option.value)}
                />
              ))}
            </div>
            {fieldErrors.method ? (
              <span className="text-xs font-medium text-red-600">{fieldErrors.method}</span>
            ) : null}
          </div>
        </fieldset>

        <div className="flex justify-end gap-2">
          <ActionButton tone="ghost" disabled={saving} onClick={() => navigate(listPath)}>
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Processing Payment...
              </span>
            ) : (
              "Initiate payment"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
