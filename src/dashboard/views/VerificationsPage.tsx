import PageHeader from "../components/PageHeader";

export default function VerificationsPage() {
  return (
    <div>
      <PageHeader
        title="Supplier Verification Management Queue"
        description="This workspace does not call a verification API. No /api/verifications route is published."
      />
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold text-[#0F3952]">Unavailable</p>
        <p className="mt-2 text-sm text-slate-500">
          Supplier onboarding verification is not connected because the backend
          does not expose a verification endpoint.
        </p>
      </section>
    </div>
  );
}
