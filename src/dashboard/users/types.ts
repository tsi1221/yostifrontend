export interface ManagedUserRole {
  id: number;
  name: string;
  description: string;
}

export interface ManagedUser {
  id: number;
  fullname: string;
  email: string;
  companyName: string;
  country: string;
  phoneWhatsapp: string;
  language_preference: string;
  role: ManagedUserRole;
}

export interface UsersListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UsersListResponse {
  data: ManagedUser[];
  meta: UsersListMeta;
}

export interface UsersListQuery {
  page: number;
  pageSize: number;
  search: string;
  fullname: string;
  email: string;
  phoneWhatsapp: string;
  companyName: string;
  roleId: number | "";
}

export const DEFAULT_USERS_QUERY: UsersListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  fullname: "",
  email: "",
  phoneWhatsapp: "",
  companyName: "",
  roleId: "",
};

export const USER_ROLE_FILTERS: { label: string; roleId: number }[] = [
  { label: "Buyer", roleId: 1 },
  { label: "Supplier", roleId: 2 },
  { label: "Logistics Partner", roleId: 3 },
  { label: "Staff", roleId: 4 },
  { label: "Super Admin", roleId: 5 },
];
