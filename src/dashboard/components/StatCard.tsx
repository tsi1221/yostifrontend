import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export default function StatCard({ title, value, hint, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3952]/10 text-[#0F3952]">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F3952]">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </article>
  );
}
