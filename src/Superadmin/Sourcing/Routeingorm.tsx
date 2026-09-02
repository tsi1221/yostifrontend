

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Send,
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

const statusStyle: Record<RFQStatus, string> = {
  OPEN: "bg-[#FDC700]/15 text-[#806500]",
  QUOTED: "bg-[#0F3952]/10 text-[#0F3952]",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

export default function ProductSourcingRFQCenter({
  onCreateRFQ,
  onSubmitQuote,
}: ProductSourcingRFQCenterProps) {
  const [region, setRegion] = useState("All Regions");
  const [status, setStatus] = useState<"ALL" | RFQStatus>("ALL");
  const [selectedId, setSelectedId] = useState("1");

  const filteredRFQs = useMemo(() => {
    return sourcingRFQs.filter((rfq) => {
      const matchesRegion =
        region === "All Regions" ||
        rfq.preferredRegion
          .toLowerCase()
          .includes(region.toLowerCase());

      const matchesStatus =
        status === "ALL" || rfq.status === status;

      return matchesRegion && matchesStatus;
    });
  }, [region, status]);

  const activeRFQ =
    filteredRFQs.find((rfq) => rfq.id === selectedId) ??
    filteredRFQs[0] ??
    null;

  const counts = {
    total: sourcingRFQs.length,
    open: sourcingRFQs.filter(
      (rfq) => rfq.status === "OPEN"
    ).length,
    quoted: sourcingRFQs.filter(
      (rfq) => rfq.status === "QUOTED"
    ).length,
    completed: sourcingRFQs.filter(
      (rfq) => rfq.status === "COMPLETED"
    ).length,
  };

  return (
    <div className="mx-auto w-full max-w-[1450px]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F3952]">
              Product Sourcing
            </h1>

            <span className="text-xs font-medium text-slate-400">
              / RFQ Center
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Manage sourcing requests, buyers, and supplier quotations.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateRFQ}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FDC700] px-4 py-2.5 text-xs font-bold text-[#0F3952] shadow-sm transition hover:bg-[#ffd633] hover:shadow sm:w-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          New RFQ
        </button>
      </header>

      {/* =====================================================
          SUMMARY
      ===================================================== */}
      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryItem
          label="Total RFQs"
          value={counts.total}
        />

        <SummaryItem
          label="Open"
          value={counts.open}
          valueClass="text-[#806500]"
        />

        <SummaryItem
          label="Quoted"
          value={counts.quoted}
        />

        <SummaryItem
          label="Completed"
          value={counts.completed}
          valueClass="text-emerald-600"
        />
      </section>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}
      <section className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        {/* REGION */}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="mr-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Region
          </span>

          {sourcingRegions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${
                region === item
                  ? "bg-[#0F3952] text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-[#0F3952]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* STATUS */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Status
          </span>

          {sourcingStatuses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition ${
                status === item
                  ? "bg-[#FDC700] text-[#0F3952] shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-[#0F3952]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(400px,1fr)]">
        {/* ===================================================
            RFQ LIST
        =================================================== */}
        <section className="min-w-0">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F3952]">
                Sourcing Requests
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                {filteredRFQs.length} request
                {filteredRFQs.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Select a request
            </span>
          </div>

          {filteredRFQs.length > 0 ? (
            <div className="space-y-3">
              {filteredRFQs.map((rfq) => (
                <RFQRow
                  key={rfq.id}
                  rfq={rfq}
                  selected={activeRFQ?.id === rfq.id}
                  onClick={() => setSelectedId(rfq.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        {/* ===================================================
            DETAIL PANEL
        =================================================== */}
        {activeRFQ && (
          <RFQDetails
            rfq={activeRFQ}
            onSubmitQuote={onSubmitQuote}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RFQ ROW
========================================================= */

function RFQRow({
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
      className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left shadow-sm transition-all duration-200 ${
        selected
          ? "border-[#0F3952]/30 bg-[#0F3952]/[0.025] shadow-md"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* ACTIVE INDICATOR */}
      <span
        className={`absolute inset-y-0 left-0 w-1 transition ${
          selected
            ? "bg-[#FDC700]"
            : "bg-transparent group-hover:bg-slate-200"
        }`}
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_110px_100px_80px_auto] md:items-center">
        {/* REQUEST */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-bold tracking-wide text-[#0F3952]">
              {rfq.reference}
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span className="text-[9px] font-medium text-slate-400">
              {rfq.preferredRegion}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-slate-800">
            {rfq.title}
          </h3>

          <div className="mt-1 flex items-center gap-1.5">
            <Building2
              size={11}
              className="shrink-0 text-slate-400"
            />

            <p className="truncate text-[10px] text-slate-400">
              {rfq.buyerCompany}
            </p>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-400 md:hidden">
            Status
          </span>

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold tracking-wide ${statusStyle[rfq.status]}`}
          >
            {rfq.status}
          </span>
        </div>

        {/* QUANTITY */}
        <div>
          <span className="block text-[9px] text-slate-400 md:hidden">
            Quantity
          </span>

          <span className="text-[10px] font-bold text-slate-700">
            {rfq.quantity}
          </span>
        </div>

        {/* QUOTES */}
        <div>
          <span className="block text-[9px] text-slate-400 md:hidden">
            Quotes
          </span>

          <span className="text-[10px] font-bold text-[#0F3952]">
            {rfq.quotesCount}
          </span>
        </div>

        {/* ARROW */}
        <div className="hidden md:flex md:justify-end">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
              selected
                ? "bg-[#FDC700] text-[#0F3952]"
                : "bg-slate-50 text-slate-300 group-hover:bg-[#0F3952]/5 group-hover:text-[#0F3952]"
            }`}
          >
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   DETAILS PANEL
========================================================= */

function RFQDetails({
  rfq,
  onSubmitQuote,
}: {
  rfq: RFQItem;
  onSubmitQuote?: () => void;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* DETAIL HEADER */}
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wide text-slate-400">
              {rfq.reference}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[8px] font-bold ${statusStyle[rfq.status]}`}
            >
              {rfq.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <Clock3 size={12} />

            <span>Deadline</span>

            <span className="font-bold text-slate-700">
              {rfq.deadline}
            </span>
          </div>
        </div>

        <h2 className="mt-4 text-base font-bold leading-6 text-[#0F3952] sm:text-lg">
          {rfq.title}
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {rfq.description}
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
        <Metric
          label="Quantity"
          value={rfq.quantity}
        />

        <Metric
          label="Target Price"
          value={rfq.targetPrice}
          highlight
        />

        <Metric
          label="Region"
          value={rfq.preferredRegion}
        />

        <Metric
          label="Sample"
          value={rfq.sampleRequired}
        />
      </div>

      {/* BUYER INFORMATION */}
      <div className="p-5 sm:p-6">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Buyer Information
        </p>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F3952]/10">
            <Building2
              size={17}
              className="text-[#0F3952]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800">
              {rfq.buyerName}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {rfq.buyerCompany}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <InfoRow
            label="Supplier Preference"
            value="Verified Manufacturers"
          />

          <InfoRow
            label="Preferred Region"
            value={rfq.preferredRegion}
          />
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-700">
              Supplier Responses
            </p>

            <span className="rounded-full bg-[#0F3952]/10 px-2 py-0.5 text-[8px] font-bold text-[#0F3952]">
              {rfq.quotesCount}
            </span>
          </div>

          <p className="mt-1 text-[10px] text-slate-400">
            {rfq.quotesCount === 0
              ? "No supplier quotes received yet."
              : `${rfq.quotesCount} supplier ${
                  rfq.quotesCount === 1
                    ? "quote"
                    : "quotes"
                } received.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmitQuote}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F3952] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#124765] hover:shadow sm:w-auto"
        >
          <Send
            size={14}
            className="-rotate-12"
          />
          Submit Quote
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  label,
  value,
  valueClass = "text-[#0F3952]",
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <span className="h-1.5 w-1.5 rounded-full bg-[#FDC700]" />
      </div>

      <p
        className={`mt-2 text-xl font-extrabold tracking-tight ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 bg-white px-4 py-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1.5 truncate text-xs font-bold ${
          highlight
            ? "text-[#0F3952]"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-[11px] font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <FileText
          size={19}
          className="text-slate-400"
        />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-700">
        No sourcing requests
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Try changing your region or status filter.
      </p>
    </div>
  );
}


