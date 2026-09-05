const TONES: Record<string, string> = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  red: "bg-red-100 text-red-800",
  navy: "bg-[#0F3952]/10 text-[#0F3952]",
  slate: "bg-slate-100 text-slate-600",
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  approved: "green",
  completed: "green",
  delivered: "green",
  resolved: "green",
  verified: "green",
  active: "green",
  accept: "green",
  accepted: "green",
  pending: "yellow",
  open: "yellow",
  quoted: "yellow",
  "in transit": "yellow",
  "at port": "yellow",
  customs: "yellow",
  scheduled: "yellow",
  "in progress": "yellow",
  booked: "yellow",
  medium: "yellow",
  rejected: "red",
  reject: "red",
  failed: "red",
  closed: "red",
  inactive: "red",
  disabled: "red",
  removed: "red",
  high: "red",
  low: "slate",
  sea: "navy",
  air: "navy",
  express: "slate",
  SUPER_ADMIN: "navy",
  STAFF: "navy",
  BUYER: "navy",
  SUPPLIER: "navy",
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
