import { Button } from "antd";
import { useNavigate } from "react-router-dom";

import {
  getAuthUserDashboardPath,
  getStoredAuthUser,
  hasValidAccessToken,
} from "../../dashboard/auth";

export default function TwoFA() {
  const navigate = useNavigate();
  const signedIn = hasValidAccessToken() && Boolean(getStoredAuthUser());
  const user = getStoredAuthUser();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,57,82,0.10)]">
        <div className="px-6 pb-3 pt-8 text-center sm:px-8">
          <h1 className="text-2xl font-bold text-[#0F3952]">
            Two-Factor Authentication
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Extra sign-in verification is not available. Please sign in with
            your email and password.
          </p>
        </div>

        <div className="px-6 pb-7 pt-3 sm:px-8">
          {signedIn && user ? (
            <Button
              type="primary"
              block
              size="large"
              className="!h-11 !rounded-lg !border-[#0F3952] !bg-[#0F3952] !font-semibold hover:!border-[#174d6b] hover:!bg-[#174d6b]"
              onClick={() =>
                navigate(getAuthUserDashboardPath(user), { replace: true })
              }
            >
              Continue to dashboard
            </Button>
          ) : (
            <Button
              type="primary"
              block
              size="large"
              className="!h-11 !rounded-lg !border-[#0F3952] !bg-[#0F3952] !font-semibold hover:!border-[#174d6b] hover:!bg-[#174d6b]"
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
