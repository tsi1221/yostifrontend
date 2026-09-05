import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { useDeleteShipment } from "./useDeleteShipment";

interface DeleteShipmentDialogProps {
  open: boolean;
  shipmentId: number | null;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteShipmentDialog({
  open,
  shipmentId,
  onClose,
  onDeleted,
}: DeleteShipmentDialogProps) {
  const { removeShipment, deleting } = useDeleteShipment();

  if (!open || shipmentId === null) {
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
        aria-labelledby="delete-shipment-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">
          Delete shipment
        </p>
        <h2 id="delete-shipment-title" className="mt-2 text-lg font-semibold text-[#0F3952]">
          Are you sure you want to delete Shipment #{shipmentId}? This action is
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
              const removed = await removeShipment(shipmentId);
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
