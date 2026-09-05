import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { findUserName, getQuotes, getSessionUser, getSourcingRequests } from "../data";
import type { SourcingRequest, SupplierQuote, UserRole } from "../types";

export default function SourcingPage({ role }: { role: UserRole }) {
  const user = getSessionUser(role);
  const requests = getSourcingRequests(role, user.id);
  const quotes = getQuotes(role, user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={role === "SUPPLIER" ? "Requests & quotes" : "Sourcing RFQs"}
        description="Buyer requests and supplier quotes from the mock schema."
      />

      <DataTable<SourcingRequest>
        rows={requests}
        rowKey={(row) => row.id}
        empty="No sourcing requests for this role."
        columns={[
          { header: "Reference", render: (row) => row.reference },
          { header: "Product", render: (row) => row.productName },
          { header: "Buyer", render: (row) => findUserName(row.buyerId) },
          { header: "Qty", render: (row) => `${row.quantity} ${row.unit}` },
          { header: "Target", render: (row) => `${row.currency} ${row.targetPrice}` },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />

      {quotes.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#0F3952]">Quotes</h2>
          <DataTable<SupplierQuote>
            rows={quotes}
            rowKey={(row) => row.id}
            empty="No quotes yet."
            columns={[
              { header: "RFQ", render: (row) => row.requestId },
              { header: "Supplier", render: (row) => findUserName(row.supplierId) },
              { header: "Unit price", render: (row) => `${row.currency} ${row.unitPrice}` },
              { header: "Lead days", render: (row) => String(row.leadDays) },
              { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
