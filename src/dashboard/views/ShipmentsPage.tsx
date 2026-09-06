import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import { ROLE_SLUG } from "../roles";
import ShipmentsTable from "../shipments/ShipmentsTable";
import { useDashboard } from "../store";

export default function ShipmentsPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Shipments"
        description="Search, filter, and page through live cargo bookings."
        actions={
          <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/logistics/new`)}>
            New shipment
          </ActionButton>
        }
      />
      <ShipmentsTable />
    </div>
  );
}
