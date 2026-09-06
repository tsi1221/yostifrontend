import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import ServicesGrid from "../services/ServicesGrid";
import { useDashboard } from "../store";

export default function ServicesPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();
  const createPath = `/${ROLE_SLUG[role]}/services/new`;

  return (
    <div>
      <PageHeader
        title="Services"
        description="Search and page through catalog offerings by title, tier, and support."
        actions={
          <ActionButton onClick={() => navigate(createPath)}>New service</ActionButton>
        }
      />
      <ServicesGrid />
    </div>
  );
}
