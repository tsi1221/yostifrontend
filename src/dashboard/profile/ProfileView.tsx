import { Mail, MapPin, Phone, Building2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, TextInput } from "../components/FormField";
import PageHeader from "../components/PageHeader";
import { ROLE_LABEL } from "../roles";
import { roleFromAuthUser } from "../auth/roleRouting";
import { useProfile } from "./useProfile";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "Y";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function ProfileView() {
  const { user, values, setField, fieldErrors, saving, refreshing, save } =
    useProfile();
  const role = user ? roleFromAuthUser(user) : null;

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your signed-in account details. These follow you on every dashboard login."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <section className="rounded-2xl bg-[#0F3952] p-6 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDC700] text-xl font-bold text-[#0F3952]">
            {initials(values.fullname || user?.fullname || "Yosti")}
          </div>
          <h2 className="mt-4 text-2xl font-bold">
            {values.fullname || user?.fullname || "Your account"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#FDC700]">
            {role ? ROLE_LABEL[role] : "Signed in"}
          </p>
          <dl className="mt-5 space-y-3 text-sm text-white/80">
            <div className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Email
                </dt>
                <dd>{user?.email || "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 size={16} className="mt-0.5 shrink-0" />
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Company
                </dt>
                <dd>{values.companyName || "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Country
                </dt>
                <dd>{values.country || "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <div>
                <dt className="text-[11px] uppercase tracking-[0.12em] text-white/50">
                  Phone / WhatsApp
                </dt>
                <dd>{values.phoneWhatsapp || "—"}</dd>
              </div>
            </div>
          </dl>
          {refreshing ? (
            <p className="mt-5 text-xs text-white/50">Refreshing account…</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#0F3952]">Account details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Email and role stay with the account. Update the contact fields you
            registered with.
          </p>

          <form
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <Field label="Full name" error={fieldErrors.fullname}>
              <TextInput
                value={values.fullname}
                onChange={(event) => setField("fullname", event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
            </Field>
            <Field label="Email">
              <TextInput value={user?.email ?? ""} readOnly disabled />
            </Field>
            <Field label="Company name" error={fieldErrors.companyName}>
              <TextInput
                value={values.companyName}
                onChange={(event) => setField("companyName", event.target.value)}
                placeholder="Company or trading name"
                autoComplete="organization"
              />
            </Field>
            <Field label="Country" error={fieldErrors.country}>
              <TextInput
                value={values.country}
                onChange={(event) => setField("country", event.target.value)}
                placeholder="Country"
                autoComplete="country-name"
              />
            </Field>
            <Field label="Phone / WhatsApp" error={fieldErrors.phoneWhatsapp}>
              <TextInput
                value={values.phoneWhatsapp}
                onChange={(event) => setField("phoneWhatsapp", event.target.value)}
                placeholder="+251 9XX XXX XXX"
                autoComplete="tel"
              />
            </Field>
            <Field label="Role">
              <TextInput
                value={role ? ROLE_LABEL[role] : ""}
                readOnly
                disabled
              />
            </Field>

            <div className="md:col-span-2">
              <ActionButton type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save profile"}
              </ActionButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
