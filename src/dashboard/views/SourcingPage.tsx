import { useState } from "react";

import ActionButton from "../components/ActionButton";
import DataTable from "../components/DataTable";
import {
  Field,
  SelectInput,
  TextArea,
  TextInput,
} from "../components/FormField";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import StatusBadge from "../components/StatusBadge";
import {
  findSupplierName,
  findUserName,
  useDashboard,
  useScopedRecords,
} from "../store";
import type { SourcingRequest, SupplierQuote, SupplierRegion } from "../types";

const REGIONS: SupplierRegion[] = ["Yiwu", "Guangzhou", "Shenzhen"];

export default function SourcingPage() {
  const { role } = useDashboard();

  if (role === "BUYER") {
    return <BuyerSourcing />;
  }
  if (role === "SUPPLIER") {
    return <SupplierRfqs />;
  }
  return <StaffAssignmentBoard />;
}

function BuyerSourcing() {
  const { snapshot, actions } = useDashboard();
  const { sourcing, quotes } = useScopedRecords();
  const [form, setForm] = useState({
    product_name: "",
    description: "",
    quantity: 100,
    target_price: 0,
    supplier_region: "Yiwu" as SupplierRegion,
    deadline: "2026-10-15",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Submit Sourcing Request"
        description="Capture product, quantity, target price, region, and deadline."
      />

      <form
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          actions.submitSourcing(form);
          setForm({
            ...form,
            product_name: "",
            description: "",
            target_price: 0,
          });
        }}
      >
        <Field label="Product name">
          <TextInput
            required
            value={form.product_name}
            onChange={(event) =>
              setForm({ ...form, product_name: event.target.value })
            }
          />
        </Field>
        <Field label="Supplier region">
          <SelectInput
            value={form.supplier_region}
            onChange={(event) =>
              setForm({
                ...form,
                supplier_region: event.target.value as SupplierRegion,
              })
            }
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Quantity">
          <TextInput
            type="number"
            min={1}
            value={form.quantity}
            onChange={(event) =>
              setForm({ ...form, quantity: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Target price (USD)">
          <TextInput
            type="number"
            min={0}
            value={form.target_price}
            onChange={(event) =>
              setForm({ ...form, target_price: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Deadline">
          <TextInput
            type="date"
            value={form.deadline}
            onChange={(event) =>
              setForm({ ...form, deadline: event.target.value })
            }
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Description">
            <TextArea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </Field>
        </div>
        <div>
          <ActionButton type="submit" tone="gold">
            Submit sourcing request
          </ActionButton>
        </div>
      </form>

      <DataTable<SourcingRequest>
        rows={sourcing}
        rowKey={(row) => row.request_id}
        empty="No sourcing requests yet."
        columns={[
          { header: "Request", render: (row) => row.request_id },
          { header: "Product", render: (row) => row.product_name },
          { header: "Qty", render: (row) => String(row.quantity) },
          { header: "Target", render: (row) => `USD ${row.target_price}` },
          { header: "Region", render: (row) => row.supplier_region },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />

      {quotes.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#0F3952]">
            Supplier quotes
          </h2>
          <DataTable<SupplierQuote>
            rows={quotes}
            rowKey={(row) => row.quote_id}
            empty="No quotes yet."
            columns={[
              { header: "Quote", render: (row) => row.quote_id },
              { header: "RFQ", render: (row) => row.request_id },
              {
                header: "Factory",
                render: (row) => findSupplierName(snapshot, row.supplier_id),
              },
              { header: "Price", render: (row) => `USD ${row.price}` },
              { header: "MOQ", render: (row) => String(row.moq) },
              { header: "Lead time", render: (row) => row.lead_time },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

function SupplierRfqs() {
  const { snapshot, actions, user } = useDashboard();
  const { sourcing, quotes, supplier } = useScopedRecords();
  const [open, setOpen] = useState<SourcingRequest | null>(null);
  const [quote, setQuote] = useState({
    price: 0,
    moq: 1,
    lead_time: "21 days",
    notes: "",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Open RFQs"
        description="Active buyer sourcing requests. Click Submit Quote to respond."
      />
      <DataTable<SourcingRequest>
        rows={sourcing}
        rowKey={(row) => row.request_id}
        empty="No open RFQs assigned to this factory."
        columns={[
          { header: "Request", render: (row) => row.request_id },
          { header: "Product", render: (row) => row.product_name },
          { header: "Buyer", render: (row) => findUserName(snapshot, row.buyer_id) },
          { header: "Qty", render: (row) => String(row.quantity) },
          { header: "Target", render: (row) => `USD ${row.target_price}` },
          { header: "Region", render: (row) => row.supplier_region },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
          {
            header: "Quote",
            render: (row) => (
              <ActionButton
                tone="gold"
                onClick={() => {
                  setQuote({
                    price: row.target_price,
                    moq: Math.min(50, row.quantity),
                    lead_time: "21 days",
                    notes: "",
                  });
                  setOpen(row);
                }}
              >
                Submit Quote
              </ActionButton>
            ),
          },
        ]}
      />

      <h2 className="text-sm font-semibold text-[#0F3952]">My quotes</h2>
      <DataTable<SupplierQuote>
        rows={quotes}
        rowKey={(row) => row.quote_id}
        empty="No quotes submitted yet."
        columns={[
          { header: "Quote", render: (row) => row.quote_id },
          { header: "RFQ", render: (row) => row.request_id },
          { header: "Price", render: (row) => `USD ${row.price}` },
          { header: "MOQ", render: (row) => String(row.moq) },
          { header: "Lead time", render: (row) => row.lead_time },
        ]}
      />

      <SideDrawer
        open={Boolean(open)}
        title="Submit Quote"
        description={open?.product_name}
        onClose={() => setOpen(null)}
        footer={
          <ActionButton
            className="w-full"
            onClick={() => {
              if (!open || !supplier) {
                return;
              }
              actions.submitQuote({
                request_id: open.request_id,
                supplier_id: supplier.supplier_id,
                ...quote,
              });
              setOpen(null);
            }}
            disabled={!supplier}
          >
            Send quote
          </ActionButton>
        }
      >
        <div className="space-y-4">
          <Field label="Price (USD)">
            <TextInput
              type="number"
              min={0}
              value={quote.price}
              onChange={(event) =>
                setQuote({ ...quote, price: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="MOQ">
            <TextInput
              type="number"
              min={1}
              value={quote.moq}
              onChange={(event) =>
                setQuote({ ...quote, moq: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Lead time">
            <TextInput
              value={quote.lead_time}
              onChange={(event) =>
                setQuote({ ...quote, lead_time: event.target.value })
              }
            />
          </Field>
          <Field label="Notes">
            <TextArea
              value={quote.notes}
              onChange={(event) =>
                setQuote({ ...quote, notes: event.target.value })
              }
            />
          </Field>
          <p className="text-xs text-slate-500">
            Quoting as {user.company_name}.
          </p>
        </div>
      </SideDrawer>
    </div>
  );
}

function StaffAssignmentBoard() {
  const { snapshot, actions } = useDashboard();
  const [draft, setDraft] = useState<Record<string, string[]>>({});

  const selected = (requestId: string, fallback: string[]) =>
    draft[requestId] ?? fallback;

  const toggle = (requestId: string, supplierId: string, fallback: string[]) => {
    const current = selected(requestId, fallback);
    setDraft({
      ...draft,
      [requestId]: current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId],
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sourcing Assignment Board"
        description="Dispatch open RFQs directly to qualified factories."
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {snapshot.sourcing_requests.map((request) => (
          <article
            key={request.request_id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {request.request_id}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#0F3952]">
                  {request.product_name}
                </h2>
                <p className="text-sm text-slate-500">
                  {findUserName(snapshot, request.buyer_id)} · {request.supplier_region} ·{" "}
                  {request.quantity} units
                </p>
              </div>
              <StatusBadge value={request.status} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{request.description}</p>
            <div className="mt-4 space-y-2">
              {snapshot.suppliers.map((factory) => {
                const assigned = selected(
                  request.request_id,
                  request.assigned_supplier_ids
                ).includes(factory.supplier_id);
                const locked = !factory.verified && !assigned;
                return (
                  <label
                    key={factory.supplier_id}
                    className={`flex items-center gap-2 text-sm ${
                      locked ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[#0F3952]"
                      disabled={locked}
                      checked={assigned}
                      onChange={() =>
                        toggle(
                          request.request_id,
                          factory.supplier_id,
                          request.assigned_supplier_ids
                        )
                      }
                    />
                    {factory.name} ({factory.location_city})
                    {factory.verified ? "" : " — unverified"}
                  </label>
                );
              })}
            </div>
            <div className="mt-4">
              <ActionButton
                onClick={() =>
                  actions.assignSourcing(
                    request.request_id,
                    selected(request.request_id, request.assigned_supplier_ids)
                  )
                }
              >
                Dispatch to factories
              </ActionButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
