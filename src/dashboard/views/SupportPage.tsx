import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import SupportsTable from "../tickets/SupportsTable";

export default function SupportPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();
  const staff = role === "SUPER_ADMIN" || role === "STAFF";

  return (
    <div>
      <PageHeader
        title={staff ? "Client support tickets" : "Support requests"}
        description="Search, filter, and page through live support tickets."
        actions={
          <ActionButton
            onClick={() => navigate(`${dashboardPath("supports")}/new`)}
          >
            New ticket
          </ActionButton>
        }
      />
      <SupportsTable />
    </div>
  );
}
