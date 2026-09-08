import PageHeader from "../components/PageHeader";
import RequestsTable from "../requests/RequestsTable";

export default function SourcingPage() {
  return (
    <div>
      <PageHeader
        title="Requests Management"
        description="Search and filter sourcing requests."
      />
      <RequestsTable />
    </div>
  );
}
