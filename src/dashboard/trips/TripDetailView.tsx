import { useNavigate, useParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
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
  const { trip, loading, notFound, serverError, retry } = useTripDetail(tripId);

  const goBack = () => navigate(listPath);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ActionButton tone="ghost" onClick={goBack}>
          Back to List
        </ActionButton>
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
    </div>
  );
}
