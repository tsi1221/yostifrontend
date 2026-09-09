import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { dashboardPath } from "../roles";
import { useDashboard } from "../store";
import TripsTable from "../trips/TripsTable";

export default function TripsPage() {
  useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Trips Management Overview"
        description="Search, filter, and page through live business trip bookings."
        actions={
          <ActionButton
            onClick={() => navigate(`${dashboardPath("trips")}/new`)}
          >
            New trip
          </ActionButton>
        }
      />
      <TripsTable />
    </div>
  );
}
