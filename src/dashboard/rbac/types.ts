export interface RolePermission {
  id: number;
  name: string;
  description: string;
  group: string;
}

export interface RoleRecord {
  id: number;
  name: string;
  description: string;
  permissionIds: number[];
  permissions: RolePermission[];
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

export interface RoleFormValues {
  name: string;
  description: string;
  permissionIds: number[];
}

export type RoleFieldErrors = Partial<
  Record<"name" | "description" | "permissionIds", string>
>;

export const EMPTY_ROLE_FORM: RoleFormValues = {
  name: "",
  description: "",
  permissionIds: [],
};

export interface CreateRoleResult {
  record: RoleRecord;
  message: string;
}

export interface RolesListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RolesListResponse {
  data: RoleRecord[];
  meta: RolesListMeta;
}

export interface RolesListQuery {
  page: number;
  pageSize: number;
  search: string;
  name: string;
}

export const DEFAULT_ROLES_QUERY: RolesListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  name: "",
};

export interface RoleErrorResponse {
  message?: string;
  fields?: RoleFieldErrors;
}

export type RoleConfiguratorMode = "create" | "edit";
