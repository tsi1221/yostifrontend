import { useState } from "react";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import type { ServiceRecord } from "./types";
import { useServicesList } from "./useServicesList";

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

function ServiceLogo({ title, logo }: { title: string; logo: string }) {
  const [failed, setFailed] = useState(false);
  const initial = title.trim().charAt(0).toUpperCase() || "S";

  if (!logo || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0F3952] text-lg font-semibold text-[#FDC700]">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt=""
      className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

function ServiceCard({ service }: { service: ServiceRecord }) {
  const features = service.details.features.slice(0, 6);
  const extra = service.details.features.length - features.length;

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-start gap-3">
        <ServiceLogo title={service.title} logo={service.logo} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#0F3952]">{service.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {service.details.tier ? <StatusBadge value={service.details.tier} /> : null}
            {service.details.support247 ? (
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-800">
                24/7 support
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                Business hours
              </span>
            )}
          </div>
        </div>
      </header>
      <ul className="flex flex-wrap gap-1.5">
        {features.length === 0 ? (
          <li className="text-xs text-slate-400">No features listed</li>
        ) : (
          features.map((feature, index) => (
            <li
              key={`${feature}-${index}`}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700"
            >
              {feature}
            </li>
          ))
        )}
        {extra > 0 ? (
          <li className="rounded-full bg-[#FDC700]/20 px-2.5 py-1 text-[11px] font-semibold text-[#0F3952]">
            +{extra} more
          </li>
        ) : null}
      </ul>
    </article>
  );
}

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={`skeleton-${index}`}
          className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex gap-3">
            <div className="h-14 w-14 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-slate-200" />
            <div className="h-6 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function ServicesGrid() {
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    services,
    meta,
    loading,
    serverError,
    retry,
  } = useServicesList();

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search services"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Title
          </span>
          <TextInput
            value={filters.title}
            onChange={(event) => setFilter("title", event.target.value)}
            placeholder="Filter by title"
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <SkeletonCards /> : null}
        {!loading && services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
            No services match these filters.
          </div>
        ) : null}
        {!loading
          ? services.map((service) => <ServiceCard key={service.id} service={service} />)
          : null}
      </div>

      <footer className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {rangeLabel(meta.page, meta.pageSize, meta.total)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <SelectInput
            value={String(filters.pageSize)}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="w-auto"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </SelectInput>
          <ActionButton
            tone="ghost"
            disabled={meta.page <= 1 || loading}
            onClick={() => setPage(meta.page - 1)}
          >
            Previous
          </ActionButton>
          <span className="px-2 text-sm font-medium text-[#0F3952]">
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <ActionButton
            disabled={meta.page >= meta.totalPages || loading}
            onClick={() => setPage(meta.page + 1)}
          >
            Next
          </ActionButton>
        </div>
      </footer>
    </div>
  );
}
