import { PROJECTS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  CreateProjectPayload,
  CreateProjectResult,
  ProjectFieldErrors,
  ProjectFormValues,
  ProjectRecord,
  ProjectsListQuery,
  ProjectsListResponse,
  UpdateProjectPayload,
} from "./types";

export { isPreviewAccessToken };

export class ProjectRequestError extends Error {
  status: number;
  fields?: ProjectFieldErrors;
  code?: "NOT_FOUND" | "TITLE_CONFLICT" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK";

  constructor(
    message: string,
    status: number,
    fields?: ProjectFieldErrors,
    code?: ProjectRequestError["code"]
  ) {
    super(message);
    this.name = "ProjectRequestError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export const PROJECT_TITLE_IN_USE_MESSAGE = "This title is already in use";
export const PROJECT_TITLE_CONFLICT_MESSAGE = "Project title already exists";
export const PROJECT_NOT_FOUND_MESSAGE =
  "This project could not be found or has been removed.";
export const CREATE_PROJECT_SUCCESS_MESSAGE = "Project created successfully.";
export const UPDATE_PROJECT_SUCCESS_MESSAGE = "Project updated successfully.";
export const PROJECTS_INVALIDATE_EVENT = "yosti:projects-invalidate";

export function invalidateProjectsCache() {
  window.dispatchEvent(new CustomEvent(PROJECTS_INVALIDATE_EVENT));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }
  return undefined;
}

function readApiMessage(raw: unknown, fallback: string) {
  const record = asRecord(raw);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string").join(", ");
    if (text) {
      return text;
    }
  }
  return fallback;
}

const FIELD_KEYS: Array<keyof ProjectFieldErrors> = ["title", "image", "details"];

function parseFieldErrors(raw: unknown): ProjectFieldErrors {
  const record = asRecord(raw);
  const fields: ProjectFieldErrors = {};
  const nested = asRecord(record?.fields) ?? asRecord(record?.errors) ?? asRecord(record?.message);

  if (nested) {
    for (const key of Object.keys(nested)) {
      if (FIELD_KEYS.includes(key as keyof ProjectFieldErrors)) {
        const value = pickString(nested[key]);
        if (value) {
          fields[key as keyof ProjectFieldErrors] = value;
        }
      }
    }
  }

  return fields;
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function asProjectId(value: unknown): number | undefined {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}

export function projectDetailUrl(id: number) {
  return `${PROJECTS_URL}/${id}`;
}

export function snippet(details: string, length = 160) {
  const text = details.replace(/\s+/g, " ").trim();
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length).trim()}…`;
}

export function validateProjectForm(values: ProjectFormValues): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {};
  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.image.trim()) {
    errors.image = "Image URL is required.";
  } else if (!isHttpUrl(values.image.trim())) {
    errors.image = "Enter a valid http(s) image URL.";
  }
  if (!values.details.trim()) {
    errors.details = "Details are required.";
  }
  return errors;
}

export function formValuesToPayload(values: ProjectFormValues): CreateProjectPayload {
  return {
    title: values.title.trim(),
    image: values.image.trim(),
    details: values.details.trim(),
  };
}

export function projectToFormValues(project: ProjectRecord): ProjectFormValues {
  return {
    title: project.title,
    image: project.image,
    details: project.details,
  };
}

export function normalizeProject(raw: unknown): ProjectRecord | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.projectId, record.project_id);
  if (id === undefined) {
    return null;
  }

  return {
    id,
    title: pickString(record.title, record.name),
    image: pickString(record.image, record.imageUrl, record.image_url, record.logo),
    details: pickString(record.details, record.content, record.body, record.description),
  };
}

function projectFromResponse(raw: unknown): ProjectRecord | null {
  return (
    normalizeProject(raw) ??
    normalizeProject(asRecord(raw)?.data) ??
    normalizeProject(asRecord(raw)?.project)
  );
}

function requireToken() {
  const token = getAccessToken();
  if (!token) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return token;
}

function authHeaders(required: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (required) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return headers;
}

export function buildProjectsQueryString(query: ProjectsListQuery) {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("pageSize", String(query.pageSize || 10));
  params.set("limit", String(query.pageSize || 10));

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.title.trim()) {
    params.set("title", query.title.trim());
  }

  return params.toString();
}

function normalizeProjectsResponse(
  raw: unknown,
  query: ProjectsListQuery
): ProjectsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.projects)
        ? record.projects
        : [];

  const data = rows
    .map((row) => normalizeProject(row))
    .filter((row): row is ProjectRecord => Boolean(row));

  const total = pickNumber(meta?.total, record?.total, nested?.total) ?? data.length;
  const page = pickNumber(meta?.page, record?.page, nested?.page) ?? query.page;
  const pageSize =
    pickNumber(meta?.pageSize, record?.pageSize, record?.limit, nested?.pageSize) ??
    query.pageSize;
  const totalPages =
    pickNumber(meta?.totalPages, record?.totalPages, nested?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  return {
    data,
    meta: { total, page, pageSize, totalPages },
  };
}

export async function fetchProjectsList(
  query: ProjectsListQuery
): Promise<ProjectsListResponse> {
  let response: Response;
  try {
    response = await fetch(`${PROJECTS_URL}?${buildProjectsQueryString(query)}`, {
      method: "GET",
      headers: authHeaders(false),
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ProjectRequestError(
      readApiMessage(raw, "Invalid project filters."),
      400,
      undefined,
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new ProjectRequestError(
      readApiMessage(raw, "The server could not load projects."),
      response.status
    );
  }

  return normalizeProjectsResponse(raw, query);
}

export async function fetchProject(id: number): Promise<ProjectRecord> {
  if (asProjectId(id) === undefined) {
    throw new ProjectRequestError(PROJECT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(projectDetailUrl(id), {
      method: "GET",
      headers: authHeaders(false),
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new ProjectRequestError(PROJECT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (!response.ok) {
    throw new ProjectRequestError(
      readApiMessage(raw, "The server could not load this project."),
      response.status
    );
  }

  const project = projectFromResponse(raw);
  if (!project) {
    throw new ProjectRequestError("The server returned an incomplete project.", 500);
  }
  return project;
}

export async function createProject(
  payload: CreateProjectPayload
): Promise<CreateProjectResult> {
  const token = requireToken();

  let response: Response;
  try {
    response = await fetch(PROJECTS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ProjectRequestError(
      readApiMessage(raw, "Unable to create this project. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 409) {
    throw new ProjectRequestError(
      PROJECT_TITLE_CONFLICT_MESSAGE,
      409,
      { title: PROJECT_TITLE_IN_USE_MESSAGE },
      "TITLE_CONFLICT"
    );
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new ProjectRequestError(
      readApiMessage(raw, "Server error occurred. Could not create project."),
      response.status
    );
  }

  const created = projectFromResponse(raw);
  if (!created) {
    throw new ProjectRequestError("The server returned an incomplete project.", 500);
  }

  invalidateProjectsCache();
  return {
    record: created,
    message: readApiMessage(raw, CREATE_PROJECT_SUCCESS_MESSAGE),
  };
}

export async function patchProject(
  id: number,
  payload: UpdateProjectPayload
): Promise<ProjectRecord> {
  const token = requireToken();
  if (asProjectId(id) === undefined) {
    throw new ProjectRequestError(PROJECT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(projectDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new ProjectRequestError(
      readApiMessage(raw, "Unable to save this project. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new ProjectRequestError(PROJECT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (response.status === 409) {
    throw new ProjectRequestError(
      "Project title conflict",
      409,
      { title: PROJECT_TITLE_IN_USE_MESSAGE },
      "TITLE_CONFLICT"
    );
  }
  if (!response.ok) {
    throw new ProjectRequestError(
      readApiMessage(raw, "Server error occurred. Could not update project."),
      response.status
    );
  }

  const updated = projectFromResponse(raw);
  if (!updated) {
    throw new ProjectRequestError("The server returned an incomplete project.", 500);
  }

  invalidateProjectsCache();
  return updated;
}

export async function deleteProject(id: number): Promise<string> {
  const token = requireToken();
  if (asProjectId(id) === undefined) {
    throw new ProjectRequestError(PROJECT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(projectDetailUrl(id), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new ProjectRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new ProjectRequestError(PROJECT_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (response.status !== 200) {
    throw new ProjectRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete project."),
      response.status
    );
  }

  invalidateProjectsCache();
  return readApiMessage(raw, "Project deleted successfully.");
}
