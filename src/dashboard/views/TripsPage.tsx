import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import DataTable from "../components/DataTable";
import {
  CheckboxRow,
  Field,
  SelectInput,
  TextInput,
} from "../components/FormField";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { ROLE_SLUG } from "../roles";
import { findUserName, useDashboard, useScopedRecords } from "../store";
import type { BusinessTrip, VisaStatus } from "../types";

function NewTripButton() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/trips/new`)}>
      New trip
    </ActionButton>
  );
}

export default function TripsPage() {
  const { role } = useDashboard();
  return role === "BUYER" ? <BuyerTripForm /> : <StaffVisaDesk />;
}

function BuyerTripForm() {
  const { actions } = useDashboard();
  const { trips } = useScopedRecords();
  const [form, setForm] = useState({
    arrival_city: "Yiwu",
    duration_days: 7,
    passport_number: "",
    nationality: "Ethiopian",
    hotel_booking: true,
    translator: true,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Submit Visa / Business Trip Form"
        description="Arrival city, duration, passport, nationality, hotel, and translator."
        actions={<NewTripButton />}
      />
      <form
        className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          actions.submitTrip(form);
          setForm({ ...form, passport_number: "" });
        }}
      >
        <Field label="Arrival city">
          <TextInput
            required
            value={form.arrival_city}
            onChange={(event) =>
              setForm({ ...form, arrival_city: event.target.value })
            }
          />
        </Field>
        <Field label="Duration (days)">
          <TextInput
            type="number"
            min={1}
            value={form.duration_days}
            onChange={(event) =>
              setForm({ ...form, duration_days: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Passport number">
          <TextInput
            required
            value={form.passport_number}
            onChange={(event) =>
              setForm({ ...form, passport_number: event.target.value })
            }
          />
        </Field>
        <Field label="Nationality">
          <TextInput
            required
            value={form.nationality}
            onChange={(event) =>
              setForm({ ...form, nationality: event.target.value })
            }
          />
        </Field>
        <CheckboxRow
          label="Hotel booking"
          checked={form.hotel_booking}
          onChange={(value) => setForm({ ...form, hotel_booking: value })}
        />
        <CheckboxRow
          label="Translator"
          checked={form.translator}
          onChange={(value) => setForm({ ...form, translator: value })}
        />
        <div className="md:col-span-2">
          <ActionButton type="submit" tone="gold">
            Submit trip / visa request
          </ActionButton>
        </div>
      </form>

      <DataTable<BusinessTrip>
        rows={trips}
        rowKey={(row) => row.trip_id}
        empty="No trip requests yet."
        columns={[
          { header: "Trip", render: (row) => row.trip_id },
          { header: "City", render: (row) => row.arrival_city },
          { header: "Days", render: (row) => String(row.duration_days) },
          { header: "Passport", render: (row) => row.passport_number },
          {
            header: "Visa",
            render: (row) => <StatusBadge value={row.visa_status} />,
          },
        ]}
      />
    </div>
  );
}

function StaffVisaDesk() {
  const { snapshot, actions } = useDashboard();
  const { trips } = useScopedRecords();

  return (
    <div>
      <PageHeader
        title="Visa parameters"
        description="Review business-trip files and update visa status."
        actions={<NewTripButton />}
      />
      <DataTable<BusinessTrip>
        rows={trips}
        rowKey={(row) => row.trip_id}
        empty="No trip files."
        columns={[
          { header: "Trip", render: (row) => row.trip_id },
          { header: "Buyer", render: (row) => findUserName(snapshot, row.buyer_id) },
          { header: "City", render: (row) => row.arrival_city },
          { header: "Nationality", render: (row) => row.nationality },
          {
            header: "Hotel",
            render: (row) => (row.hotel_booking ? "Yes" : "No"),
          },
          {
            header: "Translator",
            render: (row) => (row.translator ? "Yes" : "No"),
          },
          {
            header: "Visa status",
            render: (row) => (
              <SelectInput
                value={row.visa_status}
                onChange={(event) =>
                  actions.updateTripVisa(
                    row.trip_id,
                    event.target.value as VisaStatus
                  )
                }
              >
                {["pending", "approved", "rejected"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectInput>
            ),
          },
        ]}
      />
    </div>
  );
}
