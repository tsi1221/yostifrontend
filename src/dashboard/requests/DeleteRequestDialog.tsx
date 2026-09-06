import ActionButton from "../components/ActionButton";
import { useDeleteRequest } from "./useDeleteRequest";

interface DeleteRequestDialogProps {
  open: boolean;
  requestId: string;
  productName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteRequestDialog({
  open,
  requestId,
  productName,
  onClose,
  onDeleted,
}: DeleteRequestDialogProps) {
  const { removeRequest, deleting } = useDeleteRequest();

  if (!open) {
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
      <section className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">
          Delete request
        </p>
        <h2 className="mt-2 text-lg font-semibold text-[#0F3952]">
          Are you sure you want to delete {productName}? This action cannot be undone.
        </h2>
        <div className="mt-6 flex justify-end gap-2">
          <ActionButton tone="ghost" disabled={deleting} onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton
            tone="danger"
            disabled={deleting}
            onClick={async () => {
              const removed = await removeRequest(requestId);
              if (removed) {
                onClose();
                onDeleted();
              }
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </ActionButton>
        </div>
      </section>
    </div>
  );
}
