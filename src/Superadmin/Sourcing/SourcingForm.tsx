import React, { useState } from "react";
import { FileText, X } from "lucide-react";

export interface SourcingFormData {
  productName: string;
  technicalRequirements: string;
  quantityRequired: number | string;
  unitOfMeasure: string;
  targetUnitPrice: number | string;
  supplierRegion: string;
  sampleRequiredFirst: boolean;
  responseDeadline: string;
}

interface SourcingFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: SourcingFormData) => void;
}

const INITIAL_FORM_STATE: SourcingFormData = {
  productName: "",
  technicalRequirements: "",
  quantityRequired: 500,
  unitOfMeasure: "Units / Pieces",
  targetUnitPrice: 50,
  supplierRegion: "Yiwu Market / Zhejiang",
  sampleRequiredFirst: true,
  responseDeadline: "2026-10-15",
};

const UNIT_OPTIONS = [
  "Units / Pieces",
  "Sets",
  "Square Meters (Sqm)",
  "Metric Tons (MT)",
  "20ft / 40ft FCL",
];

const REGION_OPTIONS = [
  "Yiwu Market / Zhejiang",
  "Guangzhou / Baiyun",
  "Shenzhen (Electronics)",
  "Foshan (Tiles & Sanitary)",
  "Ningbo (Hardware & Tools)",
];

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0F3952] focus:ring-1 focus:ring-[#0F3952]/20";

const LABEL_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600";

export default function SourcingForm({
  isOpen = false,
  onClose,
  onSubmit,
}: SourcingFormProps) {
  const [formData, setFormData] =
    useState<SourcingFormData>(INITIAL_FORM_STATE);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (
        e.target as HTMLInputElement
      ).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit?.(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between bg-[#0F3952] px-6 py-4.5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <FileText
                size={17}
                className="text-[#FDC700]"
              />
            </div>

            <div>
              <h2 className="text-base font-bold tracking-tight">
                Submit New Sourcing RFQ
              </h2>

              <p className="mt-0.5 text-[10px] font-medium text-slate-300">
                Request verified supplier quotations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        {/* FORM */}
        <form
          id="sourcing-rfq-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6"
        >
          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>
              Product Name & Specifications *
            </label>

            <input
              type="text"
              name="productName"
              required
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., 5.5kVA Off-Grid Hybrid Solar Inverter with MPPT"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <label className={LABEL_CLASS}>
              Technical Requirements & Standards
            </label>

            <textarea
              name="technicalRequirements"
              rows={3}
              value={formData.technicalRequirements}
              onChange={handleChange}
              placeholder="Battery compatibility, voltage range, CE/RoHS certifications..."
              className={`${INPUT_CLASS} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>
                Quantity Required
              </label>

              <input
                type="number"
                name="quantityRequired"
                min="1"
                value={formData.quantityRequired}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>
                Unit of Measure
              </label>

              <select
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                className={`${INPUT_CLASS} cursor-pointer`}
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>
                Target Unit Price (USD)
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  $
                </span>

                <input
                  type="number"
                  name="targetUnitPrice"
                  min="0"
                  step="0.01"
                  value={formData.targetUnitPrice}
                  onChange={handleChange}
                  className={`${INPUT_CLASS} pl-7`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>
                Supplier Region in China
              </label>

              <select
                name="supplierRegion"
                value={formData.supplierRegion}
                onChange={handleChange}
                className={`${INPUT_CLASS} cursor-pointer`}
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="sampleRequiredFirst"
                checked={formData.sampleRequiredFirst}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 accent-[#0F3952]"
              />

              <span>Sample Required First</span>
            </label>

            <div className="space-y-1.5">
              <label className={LABEL_CLASS}>
                RFQ Response Deadline
              </label>

              <input
                type="date"
                name="responseDeadline"
                value={formData.responseDeadline}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <X size={14} />
            Cancel
          </button>

          <button
            type="submit"
            form="sourcing-rfq-form"
            className="rounded-lg bg-[#FDC700] px-6 py-2.5 text-xs font-bold text-[#0F3952] shadow-sm transition-all hover:bg-[#FFD633] active:scale-[0.98]"
          >
            Publish RFQ to Verified Suppliers
          </button>
        </div>
      </div>
    </div>
  );
}