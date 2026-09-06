import ActionButton from "./ActionButton";
import { useGrantSuperAdminAccess } from "../auth/useGrantSuperAdminAccess";

interface GrantSuperAdminButtonProps {
  onGranted?: () => void;
}

export default function GrantSuperAdminButton({
  onGranted,
}: GrantSuperAdminButtonProps) {
  const { grant, granting, isSuperAdmin } = useGrantSuperAdminAccess(onGranted);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <ActionButton onClick={() => void grant()} disabled={granting}>
      {granting ? "Granting…" : "Grant Super Admin full access"}
    </ActionButton>
  );
}
