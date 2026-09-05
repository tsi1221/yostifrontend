import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { ROLE_SLUG } from "../roles";
import CargoTimeline from "../components/CargoTimeline";
import DataTable from "../components/DataTable";
import { Field, SelectInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { SHIPMENT_PIPELINE, findUserName, useDashboard, useScopedRecords } from "../store";
import type { Shipment, ShipmentStatus } from "../types";

const DOC_TYPES = ["Bill of Lading", "Invoice", "Customs"];

export default function ShipmentsPage() {
  const { role } = useDashboard();

  if (role === "BUYER") {
    return <BuyerTracking />;
  }
  if (role === "LOGISTICS_PARTNER") {
    return <LogisticsConsole />;
  }

  return <ReadOnlyShipments />;
}

function NewShipmentButton() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/logistics/new`)}>
      New shipment
    </ActionButton>
  );
}

function BuyerTracking() {
  const { shipments } = useScopedRecords();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargo Tracking System"
        description="Visual step-by-step timeline for active shipments."
        actions={<NewShipmentButton />}
      />
      {shipments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
          No shipments to track.
        </p>
      ) : (
        shipments.map((shipment) => (
          <CargoTimeline key={shipment.shipment_id} shipment={shipment} />
        ))
      )}
    </div>
  );
}

function LogisticsConsole() {
  const { snapshot, actions } = useDashboard();
  const { shipments, activity } = useScopedRecords();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Bookings"
        description="Incoming buyer cargo. Update status and attach shipping documents."
        actions={<NewShipmentButton />}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {shipments.map((shipment) => (
          <article
            key={shipment.shipment_id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {shipment.tracking_number}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#0F3952]">
                  {shipment.goods_description}
                </h2>
                <p className="text-sm text-slate-500">
                  {shipment.pickup_location} → {shipment.destination_country} ·{" "}
                  {shipment.shipping_method} · {shipment.weight}kg / {shipment.volume} m³
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Buyer {findUserName(snapshot, shipment.buyer_id)}
                </p>
              </div>
              <StatusBadge value={shipment.status} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Field label="Update cargo status">
                <SelectInput
                  value={shipment.status}
                  onChange={(event) =>
                    actions.updateShipmentStatus(
                      shipment.shipment_id,
                      event.target.value as ShipmentStatus
                    )
                  }
                >
                  {SHIPMENT_PIPELINE.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Upload shipping docs">
                <input
                  type="file"
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F3952] file:px-3 file:py-2 file:text-white"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    const kind =
                      DOC_TYPES.find((item) =>
                        file.name.toLowerCase().includes(item.split(" ")[0].toLowerCase())
                      ) ?? file.name;
                    actions.uploadShipmentDoc(shipment.shipment_id, kind);
                    event.target.value = "";
                  }}
                />
              </Field>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {DOC_TYPES.map((doc) => (
                <ActionButton
                  key={doc}
                  tone="ghost"
                  onClick={() => actions.uploadShipmentDoc(shipment.shipment_id, doc)}
                >
                  {doc}
                </ActionButton>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Attached: {shipment.documents.join(", ") || "None yet"}
            </p>

            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              {activity
                .filter((row) => row.entity_id === shipment.shipment_id)
                .slice(0, 4)
                .map((row) => (
                  <li key={row.log_id} className="text-xs text-slate-500">
                    {row.created_at.slice(0, 16).replace("T", " ")} · {row.action}
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReadOnlyShipments() {
  const { shipments } = useScopedRecords();

  return (
    <div>
      <PageHeader
        title="Logistics overview"
        description="Shipments visible to this workspace."
        actions={<NewShipmentButton />}
      />
      <DataTable<Shipment>
        rows={shipments}
        rowKey={(row) => row.shipment_id}
        empty="No shipments visible."
        columns={[
          { header: "Tracking", render: (row) => row.tracking_number },
          { header: "Cargo", render: (row) => row.goods_description },
          {
            header: "Lane",
            render: (row) =>
              `${row.pickup_location} → ${row.destination_country}`,
          },
          {
            header: "Method",
            render: (row) => <StatusBadge value={row.shipping_method} />,
          },
          { header: "ETA", render: (row) => row.estimated_delivery_date },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
        ]}
      />
    </div>
  );
}
