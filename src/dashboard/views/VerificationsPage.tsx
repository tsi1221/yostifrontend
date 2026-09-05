import { useState } from "react";

import ActionButton from "../components/ActionButton";
import DataTable from "../components/DataTable";
import { Field, TextArea, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import StatusBadge from "../components/StatusBadge";
import { findSupplierName, useDashboard } from "../store";
import type { SupplierFactory, SupplierVerification } from "../types";

export default function VerificationsPage() {
  const { snapshot, role, user, actions } = useDashboard();
  const ownSupplier = snapshot.suppliers.find((row) => row.account_id === user.id);
  const [selected, setSelected] = useState<SupplierVerification | null>(null);
  const [concerns, setConcerns] = useState("");

  if (role === "SUPPLIER") {
    return <SupplierOnboarding supplier={ownSupplier} />;
  }

  const profile = snapshot.suppliers.find(
    (row) => row.supplier_id === selected?.supplier_id
  );

  return (
    <div>
      <PageHeader
        title="Supplier Verification Management Queue"
        description="Review factory profiles and approve or reject onboarding."
      />
      <DataTable<SupplierVerification>
        rows={snapshot.verifications}
        rowKey={(row) => row.verification_id}
        empty="No verification cases."
        columns={[
          {
            header: "Factory",
            render: (row) => findSupplierName(snapshot, row.supplier_id),
          },
          { header: "Turnaround", render: (row) => row.turnaround_time },
          { header: "Concerns", render: (row) => row.concerns },
          {
            header: "Status",
            render: (row) => <StatusBadge value={row.status} />,
          },
          {
            header: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  tone="ghost"
                  onClick={() => {
                    setConcerns(row.concerns);
                    setSelected(row);
                  }}
                >
                  Review
                </ActionButton>
                <ActionButton
                  tone="navy"
                  onClick={() =>
                    actions.updateVerification(row.verification_id, "approved")
                  }
                >
                  Approve
                </ActionButton>
                <ActionButton
                  tone="gold"
                  onClick={() => {
                    setConcerns(row.concerns);
                    setSelected(row);
                  }}
                >
                  Reject
                </ActionButton>
              </div>
            ),
          },
        ]}
      />

      <SideDrawer
        open={Boolean(selected)}
        title="Factory profile"
        description={profile?.name}
        onClose={() => setSelected(null)}
      >
        {profile && selected ? (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-[#0F3952]">Contact:</span>{" "}
              {profile.contact_person}
            </p>
            <p>
              <span className="font-semibold text-[#0F3952]">Location:</span>{" "}
              {profile.location_city}, {profile.location_province}
            </p>
            <p>
              <span className="font-semibold text-[#0F3952]">Verified:</span>{" "}
              {profile.verified ? "Yes" : "No"}
            </p>
            <Field label="Review notes">
              <TextArea
                value={concerns}
                onChange={(event) => setConcerns(event.target.value)}
              />
            </Field>
            <div className="flex gap-2 pt-4">
              <ActionButton
                onClick={() => {
                  actions.updateVerification(
                    selected.verification_id,
                    "approved",
                    concerns
                  );
                  setSelected(null);
                }}
              >
                Approve
              </ActionButton>
              <ActionButton
                tone="gold"
                onClick={() => {
                  actions.updateVerification(
                    selected.verification_id,
                    "rejected",
                    concerns || "Rejected after profile review."
                  );
                  setSelected(null);
                }}
              >
                Reject
              </ActionButton>
            </div>
          </div>
        ) : null}
      </SideDrawer>
    </div>
  );
}

function SupplierOnboarding({ supplier }: { supplier?: SupplierFactory }) {
  const { snapshot, actions } = useDashboard();
  const verification = snapshot.verifications.find(
    (row) => row.supplier_id === supplier?.supplier_id
  );
  const [form, setForm] = useState({
    name: supplier?.name ?? "",
    contact_person: supplier?.contact_person ?? "",
    location_city: supplier?.location_city ?? "",
    location_province: supplier?.location_province ?? "",
  });

  if (!supplier) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
        No factory profile is linked to this account.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding Verification"
        description="Current verification block and company profile."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {verification?.verification_id}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F3952]">
              {supplier.name}
            </h2>
          </div>
          <StatusBadge value={verification?.status ?? "pending"} />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Turnaround: {verification?.turnaround_time ?? "—"}.{" "}
          {verification?.concerns}
        </p>
      </section>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          actions.updateSupplierProfile(supplier.supplier_id, form);
        }}
      >
        <h2 className="text-sm font-semibold text-[#0F3952]">Company profile</h2>
        <Field label="Factory name">
          <TextInput
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <Field label="Contact person">
          <TextInput
            value={form.contact_person}
            onChange={(event) =>
              setForm({ ...form, contact_person: event.target.value })
            }
          />
        </Field>
        <Field label="City">
          <TextInput
            value={form.location_city}
            onChange={(event) =>
              setForm({ ...form, location_city: event.target.value })
            }
          />
        </Field>
        <Field label="Province">
          <TextInput
            value={form.location_province}
            onChange={(event) =>
              setForm({ ...form, location_province: event.target.value })
            }
          />
        </Field>
        <Field label="Notes">
          <TextArea readOnly value={verification?.concerns ?? ""} />
        </Field>
        <ActionButton type="submit">Save profile</ActionButton>
      </form>
    </div>
  );
}
