import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { useDeletePayment } from "./useDeletePayment";

interface DeletePaymentDialogProps {
  open: boolean;
  paymentId: number | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeletePaymentDialog({
  open,
  paymentId,
  onClose,
  onDeleted,
}: DeletePaymentDialogProps) {
  const { removePayment, deleting } = useDeletePayment();

  if (!open || paymentId === null) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={deleting ? undefined : onClose}
        aria-label="Close delete confirmation"
        disabled={deleting}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-payment-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">
          Delete payment record
        </p>
        <h2
          id="delete-payment-title"
          className="mt-2 text-lg font-semibold text-[#0F3952]"
        >
          Are you sure you want to delete this payment record? This action is
          permanent and cannot be undone.
        </h2>
        <div className="mt-6 flex justify-end gap-2">
          <ActionButton tone="ghost" disabled={deleting} onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton
            tone="danger"
            disabled={deleting}
            onClick={async () => {
              const removed = await removePayment(paymentId);
              if (removed) {
                onClose();
                onDeleted();
              }
            }}
          >
            {deleting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </ActionButton>
        </div>
      </section>
    </div>
  );
}
