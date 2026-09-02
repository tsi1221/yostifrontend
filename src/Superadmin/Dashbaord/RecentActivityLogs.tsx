import { ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { activityLogs } from "./activityMockData";

export default function RecentActivityLogs() {
  const navigate = useNavigate();

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0F3952]">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Latest system activities
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F3952]/5">
          <Clock size={17} className="text-[#0F3952]" />
        </div>
      </div>

      {/* Activity */}
      <div className="space-y-4">
        {activityLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3"
          >
            <span
              className={`mt-1 h-9 w-1 shrink-0 rounded-full ${log.color}`}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-xs font-bold uppercase tracking-wide text-slate-800">
                  {log.title}
                </h3>

                <span className="shrink-0 text-[10px] font-medium text-slate-400">
                  {log.time}
                </span>
              </div>

              <p className="mt-1 truncate text-[11px] leading-4 text-slate-500">
                {log.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={() => navigate("/superadmin/users")}
        className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FDC700] px-4 py-2.5 text-xs font-bold text-[#0F3952] transition hover:bg-[#e6b800] active:scale-[0.98]"
      >
        View Full Audit Logs Matrix
        <ChevronRight size={14} />
      </button>
    </section>
  );
}