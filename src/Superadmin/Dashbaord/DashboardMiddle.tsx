import {
  ArrowUpRight,
  CheckCircle2,
  Plane,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import { dashboardStats } from "./dashboardMockData";

export default function DashboardMiddle() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((item) => (
        <div
          key={item.title}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Top */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {item.title}
            </p>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3952]/5 text-[#0F3952] transition group-hover:bg-[#FDC700]">
              {item.type === "progress" && <Plane size={16} />}
              {item.type === "chart" && <ShoppingCart size={16} />}
              {item.type === "verified" && <CheckCircle2 size={16} />}
              {item.type === "trade" && <TrendingUp size={16} />}
            </div>
          </div>

          {/* Main Value */}
          <div className="mt-5 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight text-[#0F3952]">
                {item.value}
              </h3>

              <p
                className={`mt-1 text-[11px] font-semibold ${
                  item.type === "progress"
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </p>
            </div>

            {item.type === "trade" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDC700]/15 text-[#0F3952]">
                <ArrowUpRight size={15} />
              </div>
            )}
          </div>

          {/* Progress */}
          {item.type === "progress" && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">
                  Shipment status
                </span>

                <span className="text-[10px] font-bold text-[#0F3952]">
                  {item.progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#FDC700] transition-all"
                  style={{
                    width: `${item.progress ?? 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Mini Chart */}
          {item.type === "chart" && (
            <div className="mt-5 flex h-9 items-end gap-1">
              {item.chart?.map((height, index) => (
                <div
                  key={index}
                  className={`flex-1 rounded-t-sm transition-all ${
                    index === item.chart!.length - 1
                      ? "bg-[#FDC700]"
                      : "bg-[#0F3952]/10"
                  }`}
                  style={{
                    height: `${height * 0.7}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Verified */}
          {item.type === "verified" && (
            <div className="mt-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2
                  size={16}
                  className="text-emerald-600"
                />
              </div>

              <span className="text-[11px] font-bold text-emerald-600">
                Verified
              </span>
            </div>
          )}

          {/* Description */}
          <p className="mt-4 text-[10px] font-medium text-slate-400">
            {item.description}
          </p>

          {/* Accent */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#FDC700] opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}
    </section>
  );
}