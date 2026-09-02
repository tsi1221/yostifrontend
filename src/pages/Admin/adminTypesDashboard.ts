export interface User {
  _id: string;
  fullName: string;
  companyName: string;
  country: string;
  phone: string;
  email: string;
  accountType: string;
  languagePreference: string;
}

export interface Supplier {
  _id: string;
  name: string;
  verified: boolean;
  contactPerson: string;
  phone: string;
  email: string;
  locationCity: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalSuppliers: number;
  verifications: number;
  totalPayments: number;
}