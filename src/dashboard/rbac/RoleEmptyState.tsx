import { Shield } from "lucide-react";

import ActionButton from "../components/ActionButton";

interface RoleEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function RoleEmptyState({
  title = "No roles yet",
  description = "Create the first role and assign permission IDs. The directory stays in sync after each save.",
  actionLabel = "Create First Role",
  onAction,
}: RoleEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3952] text-[#FDC700]">
        <Shield size={28} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#0F3952]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {onAction ? (
        <div className="mt-5">
          <ActionButton onClick={onAction}>{actionLabel}</ActionButton>
        </div>
      ) : null}
    </div>
  );
}
