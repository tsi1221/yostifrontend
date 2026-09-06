export interface AuthUser {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
  role?: string;
  companyName?: string;
  country?: string;
  phoneWhatsapp?: string;
  languagePreference?: string;
}

export interface AuthLoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export type RegisterRole = "Buyer" | "Supplier" | "Logistics Partner";

export interface AuthRegisterRequest {
  fullname: string;
  email: string;
  password: string;
  companyName: string;
  country: string;
  phoneWhatsapp: string;
  role: RegisterRole;
  roleId: number;
}

export interface AuthRegisterResponse {
  message?: string | string[];
}
