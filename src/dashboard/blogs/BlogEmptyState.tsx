import { FileText } from "lucide-react";

import ActionButton from "../components/ActionButton";

interface BlogEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function BlogEmptyState({
  title = "No blog posts yet",
  description = "Publish the first article to start the catalog feed.",
  actionLabel = "Create First Blog Post",
  onAction,
}: BlogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3952] text-[#FDC700]">
        <FileText size={28} />
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
