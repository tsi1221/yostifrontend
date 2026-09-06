import { BLOGS_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  BlogFieldErrors,
  BlogFormValues,
  BlogPost,
  BlogsListQuery,
  BlogsListResponse,
  CreateBlogPayload,
  CreateBlogResult,
  UpdateBlogPayload,
} from "./types";

export { isPreviewAccessToken };

export class BlogRequestError extends Error {
  status: number;
  fields?: BlogFieldErrors;
  code?: "NOT_FOUND" | "TITLE_CONFLICT" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK";

  constructor(
    message: string,
    status: number,
    fields?: BlogFieldErrors,
    code?: BlogRequestError["code"]
  ) {
    super(message);
    this.name = "BlogRequestError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export const BLOG_TITLE_EXISTS_MESSAGE = "Title already exists";
export const BLOG_TITLE_CONFLICT_MESSAGE = "Blog title already exists";
export const BLOG_NOT_FOUND_MESSAGE =
  "This blog post could not be found or has been removed.";
export const CREATE_BLOG_SUCCESS_MESSAGE = "Blog post created successfully.";
export const UPDATE_BLOG_SUCCESS_MESSAGE = "Blog post updated successfully.";
export const BLOGS_INVALIDATE_EVENT = "yosti:blogs-invalidate";

export function invalidateBlogsCache() {
  window.dispatchEvent(new CustomEvent(BLOGS_INVALIDATE_EVENT));
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

const FIELD_KEYS: Array<keyof BlogFieldErrors> = ["title", "logo", "details"];

function parseFieldErrors(raw: unknown): BlogFieldErrors {
  const record = asRecord(raw);
  const fields: BlogFieldErrors = {};
  const nested = asRecord(record?.fields) ?? asRecord(record?.errors) ?? asRecord(record?.message);

  if (nested) {
    for (const key of Object.keys(nested)) {
      if (FIELD_KEYS.includes(key as keyof BlogFieldErrors)) {
        const value = pickString(nested[key]);
        if (value) {
          fields[key as keyof BlogFieldErrors] = value;
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

export function asBlogId(value: unknown): number | undefined {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return undefined;
  }
  return id;
}

export function blogDetailUrl(id: number) {
  return `${BLOGS_URL}/${id}`;
}

export function snippet(details: string, length = 160) {
  const text = details.replace(/\s+/g, " ").trim();
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length).trim()}…`;
}

export function validateBlogForm(values: BlogFormValues): BlogFieldErrors {
  const errors: BlogFieldErrors = {};
  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.logo.trim()) {
    errors.logo = "Logo URL is required.";
  } else if (!isHttpUrl(values.logo.trim())) {
    errors.logo = "Enter a valid http(s) logo URL.";
  }
  if (!values.details.trim()) {
    errors.details = "Details are required.";
  }
  return errors;
}

export function formValuesToPayload(values: BlogFormValues): CreateBlogPayload {
  return {
    title: values.title.trim(),
    logo: values.logo.trim(),
    details: values.details.trim(),
  };
}

export function blogToFormValues(blog: BlogPost): BlogFormValues {
  return {
    title: blog.title,
    logo: blog.logo,
    details: blog.details,
  };
}

export function normalizeBlog(raw: unknown): BlogPost | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const id = pickNumber(record.id, record.blogId, record.blog_id);
  if (id === undefined) {
    return null;
  }

  return {
    id,
    title: pickString(record.title, record.name),
    logo: pickString(record.logo, record.logoUrl, record.logo_url, record.image),
    details: pickString(record.details, record.content, record.body, record.description),
  };
}

function blogFromResponse(raw: unknown): BlogPost | null {
  return (
    normalizeBlog(raw) ??
    normalizeBlog(asRecord(raw)?.data) ??
    normalizeBlog(asRecord(raw)?.blog)
  );
}

function requireToken() {
  const token = getAccessToken();
  if (!token) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return token;
}

function authHeaders(required: boolean): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (required) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return headers;
}

export function buildBlogsQueryString(query: BlogsListQuery) {
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

function normalizeBlogsResponse(raw: unknown, query: BlogsListQuery): BlogsListResponse {
  const record = asRecord(raw);
  const nested = asRecord(record?.data);
  const meta = asRecord(record?.meta) ?? asRecord(nested?.meta);
  const rows = Array.isArray(record?.data)
    ? record.data
    : Array.isArray(nested?.data)
      ? nested.data
      : Array.isArray(record?.blogs)
        ? record.blogs
        : [];

  const data = rows
    .map((row) => normalizeBlog(row))
    .filter((row): row is BlogPost => Boolean(row));

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

export async function fetchBlogsList(query: BlogsListQuery): Promise<BlogsListResponse> {
  let response: Response;
  try {
    response = await fetch(`${BLOGS_URL}?${buildBlogsQueryString(query)}`, {
      method: "GET",
      headers: authHeaders(false),
    });
  } catch {
    throw new BlogRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new BlogRequestError(readApiMessage(raw, "Invalid blog filters."), 400, undefined, "VALIDATION");
  }
  if (response.status === 401) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status >= 500) {
    throw new BlogRequestError(
      readApiMessage(raw, "The server could not load blog posts."),
      response.status
    );
  }
  if (!response.ok) {
    throw new BlogRequestError(
      readApiMessage(raw, `Unable to load blog posts. Server returned ${response.status}.`),
      response.status
    );
  }

  return normalizeBlogsResponse(raw, query);
}

export async function fetchBlog(id: number): Promise<BlogPost> {
  if (asBlogId(id) === undefined) {
    throw new BlogRequestError(BLOG_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(blogDetailUrl(id), {
      method: "GET",
      headers: authHeaders(false),
    });
  } catch {
    throw new BlogRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new BlogRequestError(BLOG_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (!response.ok) {
    throw new BlogRequestError(
      readApiMessage(raw, "The server could not load this blog post."),
      response.status
    );
  }

  const blog = blogFromResponse(raw);
  if (!blog) {
    throw new BlogRequestError("The server returned an incomplete blog post.", 500);
  }
  return blog;
}

export async function createBlog(payload: CreateBlogPayload): Promise<CreateBlogResult> {
  const token = requireToken();

  let response: Response;
  try {
    response = await fetch(BLOGS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new BlogRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new BlogRequestError(
      readApiMessage(raw, "Unable to create this blog post. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 409) {
    throw new BlogRequestError(BLOG_TITLE_CONFLICT_MESSAGE, 409, {
      title: BLOG_TITLE_EXISTS_MESSAGE,
    }, "TITLE_CONFLICT");
  }
  if (response.status !== 200 && response.status !== 201) {
    throw new BlogRequestError(
      readApiMessage(raw, "Server error occurred. Could not create blog post."),
      response.status
    );
  }

  const created = blogFromResponse(raw);
  if (!created) {
    throw new BlogRequestError("The server returned an incomplete blog post.", 500);
  }

  invalidateBlogsCache();
  return {
    record: created,
    message: readApiMessage(raw, CREATE_BLOG_SUCCESS_MESSAGE),
  };
}

export async function patchBlog(id: number, payload: UpdateBlogPayload): Promise<BlogPost> {
  const token = requireToken();
  if (asBlogId(id) === undefined) {
    throw new BlogRequestError(BLOG_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(blogDetailUrl(id), {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new BlogRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400) {
    throw new BlogRequestError(
      readApiMessage(raw, "Unable to save this blog post. Check the highlighted fields."),
      400,
      parseFieldErrors(raw),
      "VALIDATION"
    );
  }
  if (response.status === 401) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new BlogRequestError(BLOG_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (response.status === 409) {
    throw new BlogRequestError(BLOG_TITLE_CONFLICT_MESSAGE, 409, {
      title: BLOG_TITLE_EXISTS_MESSAGE,
    }, "TITLE_CONFLICT");
  }
  if (!response.ok) {
    throw new BlogRequestError(
      readApiMessage(raw, "Server error occurred. Could not update blog post."),
      response.status
    );
  }

  const updated = blogFromResponse(raw);
  if (!updated) {
    throw new BlogRequestError("The server returned an incomplete blog post.", 500);
  }

  invalidateBlogsCache();
  return updated;
}

export async function deleteBlog(id: number): Promise<string> {
  const token = requireToken();
  if (asBlogId(id) === undefined) {
    throw new BlogRequestError(BLOG_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }

  let response: Response;
  try {
    response = await fetch(blogDetailUrl(id), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new BlogRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new BlogRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status === 404) {
    throw new BlogRequestError(BLOG_NOT_FOUND_MESSAGE, 404, undefined, "NOT_FOUND");
  }
  if (response.status !== 200) {
    throw new BlogRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete blog post."),
      response.status
    );
  }

  invalidateBlogsCache();
  return readApiMessage(raw, "Blog post deleted successfully.");
}
