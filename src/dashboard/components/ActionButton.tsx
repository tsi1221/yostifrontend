import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "navy" | "gold" | "ghost";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  children: ReactNode;
}

const TONE_CLASS: Record<Tone, string> = {
  navy: "bg-[#0F3952] text-white hover:bg-[#0F3952]/90",
  gold: "bg-[#FDC700] text-[#0F3952] hover:bg-[#FDC700]/90",
  ghost:
    "border border-slate-200 bg-white text-[#0F3952] hover:border-[#0F3952]/30",
};

export default function ActionButton({
  tone = "navy",
  className = "",
  children,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CLASS[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
