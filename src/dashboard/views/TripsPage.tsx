import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import TripsTable from "../trips/TripsTable";

export default function TripsPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Trips Management Overview"
        description="Search, filter, and page through live business trip bookings."
        actions={
          <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/trips/new`)}>
            New trip
          </ActionButton>
        }
      />
      <TripsTable />
    </div>
  );
}
