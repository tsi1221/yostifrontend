import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import PaymentsTable from "../payments/PaymentsTable";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";

export default function PaymentsPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Payments & Invoices"
        description="Search, filter, and page through live payment records."
        actions={
          <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/payments/new`)}>
            New payment
          </ActionButton>
        }
      />
      <PaymentsTable />
    </div>
  );
}
