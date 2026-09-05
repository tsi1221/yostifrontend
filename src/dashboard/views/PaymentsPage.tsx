import { useState } from "react";

import ActionButton from "../components/ActionButton";
import DataTable, { type DataTableColumn } from "../components/DataTable";
import { Field, SelectInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import StatusBadge from "../components/StatusBadge";
import { findUserName, useDashboard, useScopedRecords } from "../store";
import type { Payment, PaymentMethod } from "../types";

const METHODS: PaymentMethod[] = [
  "bank transfer",
  "card",
  "Alipay",
  "WeChat Pay",
];

export default function PaymentsPage() {
  const { snapshot, role, actions } = useDashboard();
  const { payments } = useScopedRecords();
  const [paying, setPaying] = useState<Payment | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("bank transfer");

  const columns: DataTableColumn<Payment>[] = [
    { header: "Invoice", render: (row) => row.payment_id },
    { header: "Service", render: (row) => row.service_type },
    { header: "Reference", render: (row) => row.order_reference },
  ];

  if (role !== "BUYER") {
    columns.push({
      header: "Buyer",
      render: (row) => findUserName(snapshot, row.buyer_id),
    });
  }

  columns.push(
    {
      header: "Amount",
      render: (row) => `${row.currency} ${row.amount.toLocaleString()}`,
    },
    { header: "Method", render: (row) => row.payment_method },
    {
      header: "Status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      header: "Pay",
      render: (row) =>
        row.status === "pending" ? (
          <ActionButton
            tone="gold"
            onClick={() => {
              setMethod(row.payment_method);
              setPaying(row);
            }}
          >
            Pay Now
          </ActionButton>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    }
  );

  return (
    <div>
      <PageHeader
        title="Payments & Invoices"
        description="Service fees with a functional Pay Now drawer."
      />
      <DataTable<Payment>
        rows={payments}
        rowKey={(row) => row.payment_id}
        empty="No invoices visible."
        columns={columns}
      />

      <SideDrawer
        open={Boolean(paying)}
        title="Pay Now"
        description={paying ? `${paying.currency} ${paying.amount}` : undefined}
        onClose={() => setPaying(null)}
        footer={
          <ActionButton
            className="w-full"
            tone="gold"
            onClick={() => {
              if (!paying) {
                return;
              }
              actions.payInvoice(paying.payment_id, method);
              setPaying(null);
            }}
          >
            Confirm payment
          </ActionButton>
        }
      >
        {paying ? (
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Invoice <strong className="text-[#0F3952]">{paying.payment_id}</strong>{" "}
              for {paying.service_type} ({paying.order_reference}).
            </p>
            <Field label="Payment method">
              <SelectInput
                value={method}
                onChange={(event) =>
                  setMethod(event.target.value as PaymentMethod)
                }
              >
                {METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        ) : null}
      </SideDrawer>
    </div>
  );
}
