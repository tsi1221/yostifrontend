import { useState } from "react";

import SourcingForm, {
  type SourcingFormData,
} from "./SourcingForm";

import ProductSourcingRFQCenter from "./SourcingMainUi";

import SupplierQuoteForm, {
  type SupplierQuoteData,
} from "./SupplierQuoteForm";

export default function Sourcing() {
  const [showSourcingForm, setShowSourcingForm] = useState(false);
  const [showSupplierQuoteForm, setShowSupplierQuoteForm] =
    useState(false);

  const openSourcingForm = () => {
    setShowSupplierQuoteForm(false);
    setShowSourcingForm(true);
  };

  const openSupplierQuoteForm = () => {
    setShowSourcingForm(false);
    setShowSupplierQuoteForm(true);
  };

  const closeForms = () => {
    setShowSourcingForm(false);
    setShowSupplierQuoteForm(false);
  };

  const handleSourcingSubmit = (data: SourcingFormData) => {
    console.log("New Sourcing RFQ:", data);
    closeForms();
  };

  const handleSupplierQuoteSubmit = (data: SupplierQuoteData) => {
    console.log("New Supplier Quote:", data);
    closeForms();
  };

  return (
    <main className="w-full -p-4 sm:p-5 lg:p-6">
      <ProductSourcingRFQCenter
        onCreateRFQ={openSourcingForm}
        onSubmitQuote={openSupplierQuoteForm}
      />

      <SourcingForm
        isOpen={showSourcingForm}
        onClose={closeForms}
        onSubmit={handleSourcingSubmit}
      />

      <SupplierQuoteForm
        isOpen={showSupplierQuoteForm}
        onClose={closeForms}
        onSubmit={handleSupplierQuoteSubmit}
      />
    </main>
  );
}