import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  MapPin,
  Package,
  Plus,
  Send,
  X,
} from "lucide-react";

import {
  sourcingRFQs,
  sourcingRegions,
  sourcingStatuses,
  type RFQItem,
  type RFQStatus,
} from "./sourcingMockData";

interface ProductSourcingRFQCenterProps {
  onCreateRFQ?: () => void;
  onSubmitQuote?: () => void;
}

const getStatusStyle = (status: RFQStatus) => {
  switch (status) {
    case "OPEN":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "QUOTED":
      return "bg-blue-50 text-[#0F3952] border-[#0F3952]/15";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
};

export default function ProductSourcingRFQCenter({
  onCreateRFQ,
  onSubmitQuote,
}: ProductSourcingRFQCenterProps) {
  const [region, setRegion] = useState("All Regions");
  const [status, setStatus] = useState<"ALL" | RFQStatus>("ALL");
  const [selectedId, setSelectedId] = useState("1");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filteredRFQs = useMemo(() => {
    return sourcingRFQs.filter((rfq) => {
      const regionMatch =
        region === "All Regions" ||
        rfq.preferredRegion
          .toLowerCase()
          .includes(region.toLowerCase());

      const statusMatch =
        status === "ALL" || rfq.status === status;

      return regionMatch && statusMatch;
    });
  }, [region, status]);

  const activeRFQ =
    filteredRFQs.find((rfq) => rfq.id === selectedId) ??
    filteredRFQs[0] ??
    null;

  const openCount = sourcingRFQs.filter(
    (rfq) => rfq.status === "OPEN"
  ).length;

  const quotedCount = sourcingRFQs.filter(
    (rfq) => rfq.status === "QUOTED"
  ).length;

  const completedCount = sourcingRFQs.filter(
    (rfq) => rfq.status === "COMPLETED"
  ).length;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5">
      {/* HEADER */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F3952]">
              <FileText
                size={19}
                className="text-[#FDC700]"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-[#0F3952] sm:text-xl">
                  Product Sourcing & RFQ
                </h1>

                <span className="rounded-full bg-[#FDC700]/15 px-2 py-1 text-[9px] font-bold text-[#0F3952]">
                  TRADE DESK
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Manage sourcing requests and supplier quotations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCreateRFQ}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FDC700] px-4 py-2.5 text-xs font-bold text-[#0F3952] transition hover:bg-[#ffd633] active:scale-[0.98] sm:w-auto"
          >
            <Plus size={15} />
            New Sourcing RFQ
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 border-t border-slate-100 sm:grid-cols-4">
          <Summary
            icon={<FileText size={14} />}
            label="Total"
            value={sourcingRFQs.length}
          />

          <Summary
            icon={<Clock3 size={14} />}
            label="Open"
            value={openCount}
          />

          <Summary
            icon={<Send size={14} />}
            label="Quoted"
            value={quotedCount}
          />

          <Summary
            icon={<CheckCircle2 size={14} />}
            label="Completed"
            value={completedCount}
          />
        </div>
      </section>

      {/* FILTERS */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          <button
            type="button"
            onClick={() => setMobileFilters(!mobileFilters)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 lg:hidden"
          >
            <Filter size={14} />
            {mobileFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <div
            className={`${
              mobileFilters ? "flex" : "hidden"
            } mt-4 flex-col gap-4 lg:mt-0 lg:flex lg:flex-row lg:items-center lg:justify-between`}
          >
            {/* REGION */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                <MapPin size={12} />
                Region
              </span>

              {sourcingRegions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRegion(item)}
                  className={`rounded-lg px-2.5 py-2 text-[10px] font-bold transition ${
                    region === item
                      ? "bg-[#0F3952] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* STATUS */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[10px] font-bold uppercase text-slate-400">
                Status
              </span>

              {sourcingStatuses.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`rounded-lg px-2.5 py-2 text-[10px] font-bold transition ${
                    status === item
                      ? "bg-[#FDC700] text-[#0F3952]"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[10px] text-slate-400">
              Showing{" "}
              <span className="font-bold text-[#0F3952]">
                {filteredRFQs.length}
              </span>{" "}
              requests
            </p>

            {(region !== "All Regions" || status !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setRegion("All Regions");
                  setStatus("ALL");
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#0F3952]"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
        {/* RFQ LIST */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-[#0F3952]">
                Sourcing Requests
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Select an RFQ
              </p>
            </div>

            <span className="rounded-full bg-[#0F3952]/5 px-2.5 py-1 text-[9px] font-bold text-[#0F3952]">
              {filteredRFQs.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredRFQs.length > 0 ? (
              filteredRFQs.map((rfq) => (
                <RFQCard
                  key={rfq.id}
                  rfq={rfq}
                  selected={rfq.id === activeRFQ?.id}
                  onClick={() => setSelectedId(rfq.id)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <FileText
                  size={24}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-2 text-sm font-bold text-slate-600">
                  No RFQs found
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Try another filter.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* DETAILS */}
        {activeRFQ ? (
          <RFQDetails
            rfq={activeRFQ}
            onSubmitQuote={onSubmitQuote}
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <p className="text-sm text-slate-400">
              Select an RFQ to view details.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   RFQ CARD
========================================================= */

function RFQCard({
  rfq,
  selected,
  onClick,
}: {
  rfq: RFQItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-4 text-left transition ${
        selected
          ? "border-[#0F3952] shadow-sm ring-1 ring-[#0F3952]/10"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
          {rfq.reference}
        </span>

        <span
          className={`rounded-full border px-2 py-1 text-[8px] font-extrabold ${getStatusStyle(
            rfq.status
          )}`}
        >
          {rfq.status}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-slate-800">
        {rfq.title}
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <Info label="Quantity" value={rfq.quantity} />
        <Info
          label="Target Price"
          value={rfq.targetPrice}
          accent
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 text-[9px] text-slate-400">
          <MapPin size={11} className="shrink-0" />

          <span className="truncate">
            {rfq.preferredRegion}
          </span>
        </span>

        <span className="shrink-0 rounded-md bg-[#FDC700]/15 px-2 py-1 text-[8px] font-bold text-[#0F3952]">
          {rfq.quotesCount} Quotes
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   DETAILS
========================================================= */

function RFQDetails({
  rfq,
  onSubmitQuote,
}: {
  rfq: RFQItem;
  onSubmitQuote?: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* TOP */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#0F3952] px-2.5 py-1.5 text-[9px] font-bold text-white">
              {rfq.reference}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1.5 text-[8px] font-bold ${getStatusStyle(
                rfq.status
              )}`}
            >
              {rfq.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Clock3 size={12} />

            <span>Deadline</span>

            <strong className="text-slate-700">
              {rfq.deadline}
            </strong>
          </div>
        </div>

        <h2 className="mt-5 text-lg font-extrabold leading-6 text-[#0F3952] sm:text-xl">
          {rfq.title}
        </h2>

        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
          {rfq.description}
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 border-y border-slate-100 sm:grid-cols-4">
        <DetailMetric
          label="Quantity"
          value={rfq.quantity}
        />

        <DetailMetric
          label="Target Price"
          value={rfq.targetPrice}
          accent
        />

        <DetailMetric
          label="Region"
          value={rfq.preferredRegion}
        />

        <DetailMetric
          label="Sample"
          value={rfq.sampleRequired}
        />
      </div>

      {/* BUYER */}
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F3952]/10">
              <Building2
                size={15}
                className="text-[#0F3952]"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Buyer
              </p>

              <p className="truncate text-xs font-bold text-slate-800">
                {rfq.buyerName}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-slate-500">
            {rfq.buyerCompany}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDC700]/20">
              <Package
                size={15}
                className="text-[#0F3952]"
              />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Supplier
              </p>

              <p className="text-xs font-bold text-slate-800">
                Verified Manufacturers
              </p>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-slate-500">
            Preferred: {rfq.preferredRegion}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-bold text-slate-700">
            Supplier Responses
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {rfq.quotesCount === 0
              ? "No supplier quotes received yet."
              : `${rfq.quotesCount} supplier quotes received.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmitQuote}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3952] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#124765] active:scale-[0.98] sm:w-auto"
        >
          <Send
            size={14}
            className="-rotate-12"
          />
          Submit Supplier Quote
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Summary({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5 border-r border-slate-100 px-4 py-3.5 last:border-r-0 sm:px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F3952]/5 text-[#0F3952]">
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase text-slate-400">
          {label}
        </p>

        <p className="text-base font-extrabold text-[#0F3952]">
          {value}
        </p>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-medium uppercase text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-[11px] font-bold ${
          accent ? "text-[#0F3952]" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-r border-slate-100 px-4 py-4 last:border-r-0">
      <p className="text-[9px] font-bold uppercase text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-xs font-extrabold ${
          accent ? "text-[#0F3952]" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}