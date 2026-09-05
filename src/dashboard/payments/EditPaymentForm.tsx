import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput } from "../components/FormField";
import { paymentToFormValues } from "./paymentsService";
import type {
  PaymentMethodValue,
  PaymentRecord,
  PaymentServiceValue,
  PaymentUpdateStatusValue,
  UpdatePaymentFormValues,
} from "./types";
import {
  PAYMENT_METHOD_VALUES,
  PAYMENT_SERVICE_VALUES,
  PAYMENT_UPDATE_STATUS_OPTIONS,
} from "./types";
import { useUpdatePayment } from "./useUpdatePayment";

interface EditPaymentFormProps {
  payment: PaymentRecord;
  onCancel: () => void;
  onSaved: (updated: PaymentRecord) => void;
}

const STATUS_BUTTON_CLASS: Record<PaymentUpdateStatusValue, string> = {
  Pending: "border-amber-400 bg-amber-100 text-amber-800",
  Completed: "border-green-600 bg-green-600 text-white",
  Refunded: "border-red-500 bg-red-100 text-red-700",
  Failed: "border-red-600 bg-red-600 text-white",
};

export default function EditPaymentForm({
  payment,
  onCancel,
  onSaved,
}: EditPaymentFormProps) {
  const { updatePayment, saving, fieldErrors } = useUpdatePayment(payment.id);
  const [values, setValues] = useState<UpdatePaymentFormValues>(() =>
    paymentToFormValues(payment)
  );

  useEffect(() => {
    setValues(paymentToFormValues(payment));
  }, [payment]);

  const setField = <K extends keyof UpdatePaymentFormValues>(
    key: K,
    value: UpdatePaymentFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updatePayment(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    >
      <fieldset disabled={saving} className="space-y-4">
        <Field label="Service" error={fieldErrors.service}>
          <SelectInput
            value={values.service}
            onChange={(event) =>
              setField("service", event.target.value as PaymentServiceValue)
            }
          >
            {PAYMENT_SERVICE_VALUES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Payment method" error={fieldErrors.method}>
          <SelectInput
            value={values.method}
            onChange={(event) =>
              setField("method", event.target.value as PaymentMethodValue)
            }
          >
            {PAYMENT_METHOD_VALUES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Status" error={fieldErrors.status}>
          <SelectInput
            value={values.status}
            onChange={(event) =>
              setField("status", event.target.value as PaymentUpdateStatusValue)
            }
          >
            {PAYMENT_UPDATE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
          <div
            className="grid grid-cols-2 gap-2 pt-1"
            role="group"
            aria-label="Payment status"
          >
            {PAYMENT_UPDATE_STATUS_OPTIONS.map((option) => {
              const selected = values.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setField("status", option.value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    selected
                      ? STATUS_BUTTON_CLASS[option.value]
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#0F3952]/40"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </Field>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating Transaction...
            </span>
          ) : (
            "Save changes"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
