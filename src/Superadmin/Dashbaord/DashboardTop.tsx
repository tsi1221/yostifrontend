import { FileText, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardTop() {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#0B2930] p-6 text-white shadow-sm">

      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FDC700]" />
            <span className="text-xs font-semibold uppercase text-[#FDC700]">
              China - East & Central Africa Direct Corridor
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            Good evening, Mulubhan G.
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Full administrative supervision across all trade modules,
            suppliers, and customs liaison desks.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">

          <div className="rounded-xl border border-[#FDC700]/20 bg-black/20 px-4 py-3">
            <p className="text-xs font-semibold text-[#FDC700]">
              CORRIDOR STATUS
            </p>

            <p className="text-sm text-slate-300">
              Ports & Air Hubs: Optimal
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/superadmin/sourcing")}
            className="flex items-center gap-2 rounded-xl bg-[#FDC700] px-5 py-3 text-sm font-bold text-[#0F3952] hover:bg-[#FFD633]"
          >
            <FileText size={18} />
            Sourcing RFQs
          </button>

          <button
            type="button"
            onClick={() => navigate("/superadmin/logistics")}
            className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-bold hover:border-[#FDC700]"
          >
            <Package size={18} className="text-[#FDC700]" />
            Cargo Tracker
          </button>

        </div>
      </div>

      {/* Status */}
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-700 pt-5 sm:grid-cols-2 lg:grid-cols-4">

        <Status
          title="Djibouti Port"
          value="Flowing Normal"
        />

        <Status
          title="Mombasa Corridor"
          value="24 Days Average"
        />

        <Status
          title="Yiwu Logistics Hub"
          value="Consolidation Active"
        />

        <Status
          title="Air Freight CAN → ADD"
          value="Daily Flights Booked"
        />

      </div>
    </section>
  );
}

function Status({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-400">
        {title}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#FDC700]" />

        <span className="text-sm font-semibold text-[#FDC700]">
          {value}
        </span>
      </div>
    </div>
  );
}