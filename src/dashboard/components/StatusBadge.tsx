import { BADGE_TONE_CLASS, getStatusTone } from "../statusStyles";

interface StatusBadgeProps {
  value: string;
}

export default function StatusBadge({ value }: StatusBadgeProps) {
  const tone = getStatusTone(value) ?? "slate";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${BADGE_TONE_CLASS[tone]}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
