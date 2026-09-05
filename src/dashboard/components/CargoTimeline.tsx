import type { Shipment, ShipmentStatus } from "../types";
import { SHIPMENT_PIPELINE } from "../store";

const STEP_LABEL: Record<ShipmentStatus, string> = {
  booked: "Booked",
  "in transit": "In transit",
  "at port": "At port",
  customs: "Customs",
  delivered: "Delivered",
};

export default function CargoTimeline({ shipment }: { shipment: Shipment }) {
  const current = SHIPMENT_PIPELINE.indexOf(shipment.status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            {shipment.tracking_number}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#0F3952]">
            {shipment.goods_description}
          </h3>
          <p className="text-sm text-slate-500">
            {shipment.pickup_location} → {shipment.destination_country} ·{" "}
            {shipment.shipping_method} · {shipment.weight}kg / {shipment.volume} m³
          </p>
        </div>
        <p className="text-sm text-slate-500">
          ETA {shipment.estimated_delivery_date}
        </p>
      </div>

      <ol className="relative mt-6 grid grid-cols-5 gap-2">
        <span
          className="pointer-events-none absolute left-[10%] right-[10%] top-4 h-0.5 bg-slate-200"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute left-[10%] top-4 h-0.5 bg-[#0F3952]"
          style={{
            width: `${(current / (SHIPMENT_PIPELINE.length - 1)) * 80}%`,
          }}
          aria-hidden
        />
        {SHIPMENT_PIPELINE.map((step, index) => {
          const done = index <= current;
          const active = index === current;
          return (
            <li key={step} className="relative z-10 flex flex-col items-center text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-[#FDC700] text-[#0F3952]"
                    : done
                      ? "bg-[#0F3952] text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`mt-2 text-[11px] font-semibold ${
                  done ? "text-[#0F3952]" : "text-slate-400"
                }`}
              >
                {STEP_LABEL[step]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0F3952]"
          style={{
            width: `${((current + 1) / SHIPMENT_PIPELINE.length) * 100}%`,
          }}
        />
      </div>
    </article>
  );
}
