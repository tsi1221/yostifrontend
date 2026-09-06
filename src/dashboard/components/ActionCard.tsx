import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface ActionCardProps {
  to: string;
  title: string;
  description: string;
  hint?: string;
  icon: LucideIcon;
}

export default function ActionCard({
  to,
  title,
  description,
  hint,
  icon: Icon,
}: ActionCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0F3952]/30 hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F3952] text-[#FDC700]">
        <Icon size={18} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-[#0F3952] group-hover:underline">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {hint ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {hint}
        </p>
      ) : null}
    </Link>
  );
}
