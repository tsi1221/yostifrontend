import { ChevronRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cargoData, type CargoItem } from "./cargoMockData";

const getStatusStyles = (status: CargoItem["status"]) => {
  switch (status) {
    case "IN TRANSIT":
      return "border-blue-100 bg-blue-50 text-blue-600";

    case "CUSTOMS":
      return "border-purple-100 bg-purple-50 text-purple-600";

    case "DELIVERED":
      return "border-emerald-100 bg-emerald-50 text-emerald-600";

    case "PENDING":
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export default function DashboardMidMiddle() {
  const navigate = useNavigate();

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0F3952]">
            Cargo Traffic & Transit
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Shipment tracking and transit status
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/superadmin/logistics")}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#FDC700] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wide text-[#0F3952] transition hover:bg-[#e6b800] active:scale-[0.98]"
        >
          Cargo View
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Cargo */}
      <div className="space-y-3">
        {cargoData.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            {/* Top */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-[#0F3952]">
                  {item.code}
                </span>

                <span
                  className={`rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusStyles(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <span className="text-[10px] font-semibold text-slate-400">
                  {item.mode}
                </span>
              </div>

              <p className="text-[10px] text-slate-400">
                ETA{" "}
                <span className="font-bold text-slate-700">
                  {item.eta}
                </span>
              </p>
            </div>

            {/* Title */}
            <h3 className="mt-3 text-sm font-bold leading-5 text-slate-800">
              {item.title}
            </h3>

            <div className="my-3 border-t border-slate-200/70" />

            {/* Route + Load */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin
                  size={14}
                  className="shrink-0 text-[#0F3952]"
                />

                <p className="truncate text-[10px] text-slate-400">
                  {item.origin}

                  <span className="mx-1.5 text-slate-300">
                    →
                  </span>

                  <span className="font-semibold text-slate-700">
                    {item.destination}
                  </span>
                </p>
              </div>

              <p className="shrink-0 text-[10px] font-bold text-slate-600">
                {item.weightKg.toLocaleString()} kg
                <span className="mx-1 text-slate-300">•</span>
                {item.volumeCbm} CBM
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}