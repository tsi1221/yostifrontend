import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormField";
import type { ContactFormValues, ContactRecord } from "./types";
import { CONTACT_TOPIC_VALUES } from "./types";
import { asContactId, contactToFormValues } from "./api";
import { useUpdateContact } from "./useUpdateContact";

interface EditContactFormProps {
  contact: ContactRecord;
  onCancel: () => void;
  onSaved: (updated: ContactRecord) => void;
}

export default function EditContactForm({
  contact,
  onCancel,
  onSaved,
}: EditContactFormProps) {
  const contactId = asContactId(contact.id) ?? 0;
  const { updateContact, saving, notFound, fieldErrors } = useUpdateContact(contactId);
  const [values, setValues] = useState<ContactFormValues>(() =>
    contactToFormValues(contact)
  );

  useEffect(() => {
    setValues(contactToFormValues(contact));
  }, [contact]);

  const setField = <K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const updated = await updateContact(values);
        if (updated) {
          onSaved(updated);
        }
      }}
    >
      {notFound ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {notFound}
        </div>
      ) : null}

      <fieldset disabled={saving} className="space-y-4">
        <Field label="Full name" error={fieldErrors.fullname}>
          <TextInput
            value={values.fullname}
            onChange={(event) => setField("fullname", event.target.value)}
          />
        </Field>
        <Field label="WhatsApp" error={fieldErrors.phoneWhatsapp}>
          <TextInput
            type="tel"
            value={values.phoneWhatsapp}
            onChange={(event) => setField("phoneWhatsapp", event.target.value)}
          />
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          <TextInput
            type="email"
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
            {values.topic &&
            !CONTACT_TOPIC_VALUES.includes(
              values.topic as (typeof CONTACT_TOPIC_VALUES)[number]
            ) ? (
              <option value={values.topic}>{values.topic}</option>
            ) : null}
          </SelectInput>
        </Field>
        <Field label="Details" error={fieldErrors.details}>
          <TextArea
            value={values.details}
            onChange={(event) => setField("details", event.target.value)}
          />
        </Field>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <ActionButton tone="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" className="flex-1" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Updating Contact...
            </span>
          ) : (
            "Save changes"
          )}
        </ActionButton>
      </div>
    </form>
  );
}
