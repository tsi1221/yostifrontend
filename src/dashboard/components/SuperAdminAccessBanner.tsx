import ActionButton from "./ActionButton";
import { useGrantSuperAdminAccess } from "../auth/useGrantSuperAdminAccess";

interface SuperAdminAccessBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function SuperAdminAccessBanner({
  message,
  onRetry,
}: SuperAdminAccessBannerProps) {
  const { grant, granting, isSuperAdmin } = useGrantSuperAdminAccess(onRetry);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-amber-900">{message}</p>
      <div className="flex flex-wrap gap-2">
        {onRetry ? (
          <ActionButton tone="ghost" onClick={onRetry} disabled={granting}>
            Retry
          </ActionButton>
        ) : null}
        <ActionButton onClick={() => void grant()} disabled={granting}>
          {granting ? "Granting…" : "Grant Super Admin full access"}
        </ActionButton>
      </div>
    </section>
  );
}
