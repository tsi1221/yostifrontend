import { Inbox } from "lucide-react";

interface ContactEmptyStateProps {
  title?: string;
  description?: string;
}

export default function ContactEmptyState({
  title = "Inbox is empty",
  description = "New visitor messages will appear here when they submit the public contact form.",
}: ContactEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F3952] text-[#FDC700]">
        <Inbox size={28} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#0F3952]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}
