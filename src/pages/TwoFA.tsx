import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../VisitorPublicUser/components/BackgroundLayout";

const TwoFA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-4 text-center text-3xl font-extrabold text-[#0F3952]">
          Two-Factor Authentication
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          The live Yosti API does not expose a two-factor verification
          endpoint. Sign-in uses email and password only.
        </p>
        <Button
          type="primary"
          block
          className="!bg-[#0F3952]"
          onClick={() => navigate("/login", { replace: true })}
        >
          Back to sign in
        </Button>
      </div>
    </AuthLayout>
  );
};

export default TwoFA;
