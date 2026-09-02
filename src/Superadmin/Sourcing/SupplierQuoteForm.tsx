import React, { useState } from "react";
import { Send, X } from "lucide-react";

export interface BuyerRequestInfo {
  productTitle: string;
  quantity: string;
  targetPrice: string;
}

export interface SupplierQuoteData {
  offeredUnitPrice: number | string;
  minOrderQty: number | string;
  productionLeadTime: number | string;
  quotationTermsNotes: string;
}

interface SupplierQuoteFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: SupplierQuoteData) => void;
  buyerRequest?: BuyerRequestInfo;
}

const DEFAULT_BUYER_REQUEST: BuyerRequestInfo = {
  productTitle:
    "5.5kVA Off-Grid Hybrid Solar Inverter with MPPT (48V)",
  quantity: "300 Units",
  targetPrice: "$215",
};

const INITIAL_FORM_STATE: SupplierQuoteData = {
  offeredUnitPrice: 48.5,
  minOrderQty: 100,
  productionLeadTime: 14,
  quotationTermsNotes:
    "Includes standard export packaging, CE/RoHS conformity certificate, and 1-year manufacturer warranty.",
};

export default function SupplierQuoteForm({
  isOpen = false,
  onClose,
  onSubmit,
  buyerRequest = DEFAULT_BUYER_REQUEST,
}: SupplierQuoteFormProps) {
  const [formData, setFormData] =
    useState<SupplierQuoteData>(INITIAL_FORM_STATE);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

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
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between bg-[#0F3952] px-6 py-4.5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Send
                size={17}
                className="-rotate-12 text-[#FDC700]"
              />
            </div>

            <div>
              <h2 className="text-base font-bold tracking-tight">
                Submit Wholesale Supplier Quote
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-300">
                Send your quotation to the buyer
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
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6"
        >
          {/* BUYER REQUEST */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Replying to Buyer Request
            </p>

            <p className="mt-1 text-sm font-extrabold text-[#0F3952]">
              {buyerRequest.productTitle}
            </p>

            <p className="mt-1.5 text-[10px] font-medium text-slate-500">
              Qty: {buyerRequest.quantity}
              <span className="mx-1.5">•</span>
              Target: {buyerRequest.targetPrice}
            </p>
          </div>

          {/* PRICE + MOQ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Offered Unit Price (USD) *
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                name="offeredUnitPrice"
                required
                value={formData.offeredUnitPrice}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0F3952] focus:ring-1 focus:ring-[#0F3952]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Minimum Order Qty
              </label>

              <input
                type="number"
                min="1"
                name="minOrderQty"
                value={formData.minOrderQty}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0F3952] focus:ring-1 focus:ring-[#0F3952]/20"
              />
            </div>
          </div>

          {/* LEAD TIME */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Production Lead Time (Days)
            </label>

            <input
              type="number"
              min="1"
              name="productionLeadTime"
              value={formData.productionLeadTime}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0F3952] focus:ring-1 focus:ring-[#0F3952]/20"
            />
          </div>

          {/* NOTES */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Quotation Terms & Packaging Notes
            </label>

            <textarea
              name="quotationTermsNotes"
              rows={4}
              value={formData.quotationTermsNotes}
              onChange={handleChange}
              placeholder="Specify warranty, packaging, certifications..."
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0F3952] focus:ring-1 focus:ring-[#0F3952]/20"
            />
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
            className="flex items-center gap-2 rounded-lg bg-[#FDC700] px-5 py-2.5 text-xs font-bold text-[#0F3952] shadow-sm transition-all hover:bg-[#FFD633] active:scale-[0.98]"
          >
            <Send
              size={14}
              className="-rotate-12"
            />
            Dispatch Quotation
          </button>
        </div>
      </div>
    </div>
  );
}