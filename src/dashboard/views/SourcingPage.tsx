import PageHeader from "../components/PageHeader";
import RequestsTable from "../requests/RequestsTable";

export default function SourcingPage() {
  return (
    <div>
      <PageHeader
        title="Requests Management"
        description="Search, filter, and page through live sourcing requests from the Yosti API."
      />
      <RequestsTable />
    </div>
  );
}
