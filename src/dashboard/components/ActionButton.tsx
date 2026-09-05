import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "navy" | "gold" | "ghost";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  children: ReactNode;
}

const TONE_CLASS: Record<Tone, string> = {
  navy: "bg-[#0F3952] text-white hover:bg-[#0F3952]/90",
  gold: "bg-[#0F3952] text-white hover:bg-[#0F3952]/90",
  ghost:
    "border border-[#0F3952] bg-[#0F3952] text-white hover:bg-[#0F3952]/90",
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
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CLASS[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
