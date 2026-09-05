const TONES: Record<string, string> = {
  navy: "bg-[#0F3952]/10 text-[#0F3952]",
  gold: "bg-[#FDC700]/20 text-[#0F3952]",
  slate: "bg-slate-100 text-slate-600",
};

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  ACTIVE: "navy",
  PAID: "navy",
  PASSED: "navy",
  COMPLETED: "navy",
  DELIVERED: "navy",
  ISSUED: "navy",
  PUBLISHED: "navy",
  AWARDED: "navy",
  ACCEPTED: "navy",
  RESOLVED: "navy",
  PENDING: "gold",
  OPEN: "gold",
  QUOTED: "gold",
  SUBMITTED: "gold",
  IN_TRANSIT: "gold",
  IN_PROGRESS: "gold",
  PROCESSING: "gold",
  CUSTOMS: "gold",
  PLANNED: "gold",
  DRAFT: "slate",
  INACTIVE: "slate",
  FAILED: "slate",
  REJECTED: "slate",
  CANCELLED: "slate",
  DELAYED: "slate",
  CLOSED: "slate",
  NEW: "gold",
  REVIEWED: "navy",
  HIGH: "gold",
  URGENT: "gold",
  MEDIUM: "navy",
  LOW: "slate",
  SEA: "navy",
  AIR: "gold",
  ROAD: "slate",
};

interface StatusBadgeProps {
  value: string;
}

export default function StatusBadge({ value }: StatusBadgeProps) {
  const tone = STATUS_TONE[value] ?? "slate";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONES[tone]}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
