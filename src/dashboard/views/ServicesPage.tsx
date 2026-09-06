import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";

export default function ServicesPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();
  const createPath = `/${ROLE_SLUG[role]}/services/new`;

  return (
    <div>
      <PageHeader
        title="Services"
        description="Create catalog offerings with a title, logo, tier, and feature list."
        actions={
          <ActionButton onClick={() => navigate(createPath)}>New service</ActionButton>
        }
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Publish a new catalog service. A live directory will appear here when the
          services list API is connected.
        </p>
      </div>
    </div>
  );
}
