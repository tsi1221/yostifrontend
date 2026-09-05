const TONES: Record<string, string> = {
  navy: "bg-[#0F3952]/10 text-[#0F3952]",
  gold: "bg-[#FDC700]/20 text-[#0F3952]",
  slate: "bg-slate-100 text-slate-600",
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  approved: "navy",
  completed: "navy",
  delivered: "navy",
  resolved: "navy",
  verified: "navy",
  active: "navy",
  pending: "gold",
  open: "gold",
  quoted: "gold",
  "in transit": "gold",
  "at port": "gold",
  customs: "gold",
  scheduled: "gold",
  "in progress": "gold",
  booked: "gold",
  high: "gold",
  medium: "navy",
  rejected: "slate",
  failed: "slate",
  closed: "slate",
  inactive: "slate",
  low: "slate",
  sea: "navy",
  air: "gold",
  express: "slate",
  SUPER_ADMIN: "navy",
  STAFF: "navy",
  BUYER: "gold",
  SUPPLIER: "gold",
  LOGISTICS_PARTNER: "slate",
};

interface StatusBadgeProps {
  value: string;
}

export default function StatusBadge({ value }: StatusBadgeProps) {
  const tone = STATUS_TONE[value] ?? STATUS_TONE[value.toLowerCase()] ?? "slate";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${TONES[tone]}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
