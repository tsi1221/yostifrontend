import PageHeader from "../components/PageHeader";
import PaymentsTable from "../payments/PaymentsTable";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Payments & Invoices"
        description="Search, filter, and page through live payment records."
      />
      <PaymentsTable />
    </div>
  );
}
