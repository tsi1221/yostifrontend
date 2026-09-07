import ActionButton from "./ActionButton";

export function SessionLoading({
  label = "Loading your workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm font-medium text-[#0F3952]">{label}</p>
    </div>
  );
}

export default function AccessState({
  title = "You don't have access to this section.",
  description = "If you believe this is a mistake, contact your administrator.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <p className="text-lg font-semibold text-[#0F3952]">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <ActionButton className="mt-4" onClick={onAction}>
          {actionLabel}
        </ActionButton>
      ) : null}
    </section>
  );
}
