export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface PermissionOption {
  value: number;
  label: string;
  description: string;
}

export interface PermissionsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PermissionsListResponse {
  data: Permission[];
  meta: PermissionsListMeta;
}

export interface PermissionsListQuery {
  page: number;
  pageSize: number;
  search: string;
}

export const DEFAULT_PERMISSIONS_QUERY: PermissionsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
};

export const LOOKUP_PERMISSIONS_QUERY: PermissionsListQuery = {
  page: 1,
  pageSize: 200,
  search: "",
};
