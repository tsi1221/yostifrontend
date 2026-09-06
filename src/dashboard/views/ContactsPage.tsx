import PageHeader from "../components/PageHeader";
import ContactsTable from "../contacts/ContactsTable";

export default function ContactsPage() {
  return (
    <div>
      <PageHeader
        title="Contact inbox"
        description="Search, page, edit, and delete visitor submissions."
      />
      <ContactsTable />
    </div>
  );
}
