export interface BlogPost {
  id: number;
  title: string;
  logo: string;
  details: string;
}

export interface CreateBlogPayload {
  title: string;
  logo: string;
  details: string;
}

export interface UpdateBlogPayload {
  title?: string;
  logo?: string;
  details?: string;
}

export interface BlogFormValues {
  title: string;
  logo: string;
  details: string;
}

export type BlogFieldErrors = Partial<Record<"title" | "logo" | "details", string>>;

export const EMPTY_BLOG_FORM: BlogFormValues = {
  title: "",
  logo: "",
  details: "",
};

export interface CreateBlogResult {
  record: BlogPost;
  message: string;
}

export interface BlogsListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlogsListResponse {
  data: BlogPost[];
  meta: BlogsListMeta;
}

export interface BlogsListQuery {
  page: number;
  pageSize: number;
  search: string;
  title: string;
}

export const DEFAULT_BLOGS_QUERY: BlogsListQuery = {
  page: 1,
  pageSize: 10,
  search: "",
  title: "",
};

export interface DeleteBlogResponse {
  message: string;
}

export type BlogDeletionPhase = "idle" | "confirming" | "deleting";
