import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormField";
import type { ContactFormValues } from "./types";
import { CONTACT_TOPIC_VALUES, EMPTY_CONTACT_FORM } from "./types";
import { useSubmitContact } from "./useSubmitContact";

export default function PublicContactForm() {
  const { sendMessage, saving, sent, successMessage, fieldErrors, reset } =
    useSubmitContact();
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM);

  const setField = <K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-[#0F3952]">{successMessage}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Our team will follow up on WhatsApp or email shortly.
        </p>
        <div className="mt-6">
          <ActionButton
            onClick={() => {
              setValues(EMPTY_CONTACT_FORM);
              reset();
            }}
          >
            Send another message
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
        Contact
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[#0F3952]">Talk to Yosti</h1>
      <p className="mt-2 text-sm text-slate-500">
        Share your sourcing, logistics, or partnership request. We reply on WhatsApp.
      </p>

      <form
        className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        noValidate
        onSubmit={async (event) => {
          event.preventDefault();
          await sendMessage(values);
        }}
      >
        <fieldset disabled={saving} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full name" error={fieldErrors.fullname}>
            <TextInput
              placeholder="Ada Bekele"
              value={values.fullname}
              onChange={(event) => setField("fullname", event.target.value)}
            />
          </Field>
          <Field label="WhatsApp" error={fieldErrors.phoneWhatsapp}>
            <TextInput
              type="tel"
              placeholder="+251 911 000 000"
              value={values.phoneWhatsapp}
              onChange={(event) => setField("phoneWhatsapp", event.target.value)}
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <TextInput
              type="email"
              placeholder="ada@company.com"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </Field>
          <Field label="Topic" error={fieldErrors.topic}>
            <SelectInput
              value={values.topic}
              onChange={(event) => setField("topic", event.target.value)}
            >
              <option value="">Select a topic</option>
              {CONTACT_TOPIC_VALUES.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="md:col-span-2">
            <Field label="Details" error={fieldErrors.details}>
              <TextArea
                placeholder="Tell us what you need help with..."
                value={values.details}
                onChange={(event) => setField("details", event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <div className="flex justify-end">
          <ActionButton type="submit" disabled={saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Sending Message...
              </span>
            ) : (
              "Send message"
            )}
          </ActionButton>
        </div>
      </form>
    </div>
  );
}
