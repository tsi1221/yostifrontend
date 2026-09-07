import PageHeader from "../components/PageHeader";

export default function VerificationsPage() {
  return (
    <div>
      <PageHeader
        title="Supplier Verification Management Queue"
        description="Review supplier onboarding when verification records are available."
      />
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold text-[#0F3952]">
          Verification is not available yet
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Supplier onboarding review is not set up for this workspace. Please
          check back later or contact your administrator.
        </p>
      </section>
    </div>
  );
}
