import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import InspectionsTable from "../inspections/InspectionsTable";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";

export default function InspectionsPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Inspection requests"
        description="Search, filter, and page through live quality inspection bookings."
        actions={
          <ActionButton
            onClick={() => navigate(`/${ROLE_SLUG[role]}/quality-control/new`)}
          >
            New inspection
          </ActionButton>
        }
      />
      <InspectionsTable />
    </div>
  );
}
