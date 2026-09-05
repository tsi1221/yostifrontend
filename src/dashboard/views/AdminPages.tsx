import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { dashboardSnapshot, findUserName, getSessionUser, getTickets } from "../data";
import type { ContactMessage, StoredFile, SupportTicket, UserRole } from "../types";

export function ContactsPage() {
  return (
    <div>
      <PageHeader title="Contacts" description="Inbound public contact form messages." />
      <DataTable<ContactMessage>
        rows={dashboardSnapshot.contacts}
        rowKey={(row) => row.id}
        empty="No messages."
        columns={[
          { header: "Name", render: (row) => row.name },
          { header: "Company", render: (row) => row.company },
          { header: "Subject", render: (row) => row.subject },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}

export function FilesPage() {
  return (
    <div>
      <PageHeader title="Files" description="Trade documents stored against the workspace." />
      <DataTable<StoredFile>
        rows={dashboardSnapshot.files}
        rowKey={(row) => row.id}
        empty="No files."
        columns={[
          { header: "File", render: (row) => row.name },
          { header: "Type", render: (row) => row.type },
          { header: "Size", render: (row) => `${row.sizeKb} KB` },
          { header: "Uploaded by", render: (row) => findUserName(row.uploadedBy) },
        ]}
      />
    </div>
  );
}

export function SupportPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const rows = getTickets(role, user.id);

  return (
    <div>
      <PageHeader title="Support tickets" description="Tickets this role is allowed to see." />
      <DataTable<SupportTicket>
        rows={rows}
        rowKey={(row) => row.id}
        empty="No tickets."
        columns={[
          { header: "Subject", render: (row) => row.subject },
          { header: "Requester", render: (row) => findUserName(row.userId) },
          { header: "Category", render: (row) => row.category },
          { header: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
