import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import DeleteTripDialog from "./DeleteTripDialog";
import EditTripForm from "./EditTripForm";
import {
  formatTripDuration,
  formatTripStatus,
  isOngoingTripStatus,
  isPlannedTripStatus,
} from "./tripsService";
import { useTripDetail } from "./useTripDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const label = formatTripStatus(status);

  if (isOngoingTripStatus(status)) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {label}
      </span>
    );
  }

  if (isPlannedTripStatus(status)) {
    return (
      <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#0F3952]/10 px-3 py-1 text-xs font-semibold text-[#0F3952]">
      {label}
    </span>
  );
}

function InfoCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </h2>
      <p
        className={`mt-3 text-xl font-semibold text-[#0F3952] ${
          accent ? "rounded-xl bg-[#FDC700]/20 px-4 py-3" : ""
        }`}
      >
        {value}
      </p>
    </section>
  );
}

export default function TripDetailView() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/trips`;
  const [searchParams, setSearchParams] = useSearchParams();
  const { trip, loading, notFound, serverError, applyTrip, retry } =
    useTripDetail(tripId);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goBack = () => navigate(listPath);
  const closeEditor = () => {
    setEditing(false);
    if (searchParams.get("edit") === "1") {
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton tone="ghost" onClick={goBack}>
          Back to List
        </ActionButton>
        {trip ? (
          <div className="flex gap-2">
            <ActionButton onClick={() => setEditing(true)}>Edit itinerary</ActionButton>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {loading ? <DetailSkeleton /> : null}

      {!loading && notFound ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">Itinerary not found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            This trip itinerary could not be found or has been removed.
          </p>
          <ActionButton className="mt-5" onClick={goBack}>
            Back to List
          </ActionButton>
        </section>
      ) : null}

      {!loading && !notFound && serverError ? (
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#0F3952]">
            Unable to load trip details
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{serverError}</p>
          <ActionButton className="mt-5" onClick={retry}>
            Retry Connection
          </ActionButton>
        </section>
      ) : null}

      {!loading && trip ? (
        <div className="space-y-4">
          <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
              Trip itinerary
            </p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold md:text-4xl">
                {trip.arrivalCity || "—"}
              </h1>
              <TripStatusBadge status={trip.status} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              accent
              label="Duration"
              value={`⏱️ ${formatTripDuration(trip.duration)}`}
            />
            <InfoCard label="Hotel" value={trip.hotel || "—"} />
            <InfoCard label="Transport" value={trip.transport || "—"} />
            <InfoCard label="Translator" value={trip.translator || "—"} />
          </div>

          <p className="text-xs text-slate-400">
            Trip ID {trip.id} · User ID {trip.userId}
          </p>
        </div>
      ) : null}

      <SideDrawer
        open={Boolean(editing && trip)}
        title={trip ? `Edit trip #${trip.id}` : "Edit trip itinerary"}
        description="Update itinerary details and save. Changes are sent with PATCH."
        onClose={closeEditor}
      >
        {trip ? (
          <EditTripForm
            trip={trip}
            onCancel={closeEditor}
            onSaved={(updated) => {
              applyTrip(updated);
              closeEditor();
            }}
          />
        ) : null}
      </SideDrawer>

      <DeleteTripDialog
        open={Boolean(confirmDelete && trip)}
        tripId={trip?.id ?? null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => {
          setConfirmDelete(false);
          closeEditor();
          navigate(listPath, { replace: true });
        }}
      />
    </div>
  );
}
