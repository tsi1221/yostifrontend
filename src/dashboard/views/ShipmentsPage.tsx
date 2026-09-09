import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { dashboardPath } from "../roles";
import ShipmentsTable from "../shipments/ShipmentsTable";
import { useDashboard } from "../store";

export default function ShipmentsPage() {
  useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Search, filter, and page through live cargo bookings."
        actions={
          <ActionButton
            onClick={() => navigate(`${dashboardPath("logistics")}/new`)}
          >
            New shipment
          </ActionButton>
        }
      />
      <ShipmentsTable />
    </div>
  );
}
