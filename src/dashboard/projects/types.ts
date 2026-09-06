export interface ProjectRecord {
  id: number;
  title: string;
  image: string;
  details: string;
}

export interface CreateProjectPayload {
  title: string;
  image: string;
  details: string;
}

export interface UpdateProjectPayload {
  title?: string;
  image?: string;
  details?: string;
}

export interface ProjectFormValues {
  title: string;
  image: string;
  details: string;
}

export type ProjectFieldErrors = Partial<Record<"title" | "image" | "details", string>>;

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  title: "",
  image: "",
  details: "",
};

export interface CreateProjectResult {
  record: ProjectRecord;
  message: string;
}

export interface ProjectsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectsListResponse {
  data: ProjectRecord[];
  meta: ProjectsListMeta;
}

export interface ProjectsListQuery {
  page: number;
  pageSize: number;
  search: string;
  title: string;
}

export const DEFAULT_PROJECTS_QUERY: ProjectsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  title: "",
};

export interface DeleteProjectResponse {
  message: string;
}

export type ProjectDeletionPhase = "idle" | "confirming" | "deleting";
