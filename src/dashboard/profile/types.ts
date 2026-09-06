export interface ProfileFormValues {
  fullname: string;
  companyName: string;
  country: string;
  phoneWhatsapp: string;
}

export type ProfileFieldErrors = Partial<Record<keyof ProfileFormValues, string>>;

export interface ProfileUpdatePayload {
  fullname: string;
  companyName: string;
  country: string;
  phoneWhatsapp: string;
}
