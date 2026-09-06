import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import { BLOG_NOT_FOUND_MESSAGE, asBlogId } from "./api";
import DeleteBlogDialog from "./DeleteBlogDialog";
import EditBlogForm from "./EditBlogForm";
import { useBlogDetail } from "./useBlogDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function BlogDetailView() {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/blogs`;
  const { blog, loading, notFound, serverError, retry } = useBlogDetail(blogId);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const editing = searchParams.get("edit") === "1";

  return (
    <div>
      <PageHeader
        title={blog?.title || "Blog post"}
        description="Review the published article, then edit or delete it."
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
              Back to blogs
            </ActionButton>
            {blog ? (
              <>
                <ActionButton onClick={() => setSearchParams({ edit: "1" })}>
                  Edit
                </ActionButton>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                  aria-label="Delete blog post"
                  onClick={() => {
                    const id = asBlogId(blog.id);
                    if (id !== undefined) {
                      setPendingDelete(id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : null}
          </div>
        }
      />

      {loading ? <DetailSkeleton /> : null}

      {!loading && notFound ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">{BLOG_NOT_FOUND_MESSAGE}</p>
          <div className="mt-4">
            <ActionButton onClick={() => navigate(listPath)}>Back to blogs</ActionButton>
          </div>
        </div>
      ) : null}

      {!loading && serverError && !notFound ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </div>
      ) : null}

      {!loading && blog ? (
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            {blog.logo ? (
              <img
                src={blog.logo}
                alt=""
                className="h-20 w-20 rounded-2xl border border-slate-200 object-contain"
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Post #{blog.id}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#0F3952]">{blog.title}</h2>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{blog.details}</p>
        </article>
      ) : null}

      <SideDrawer
        open={Boolean(blog) && editing}
        title={blog ? `Edit post #${blog.id}` : "Edit post"}
        description="Update title, logo URL, and article details."
        onClose={() => setSearchParams({})}
      >
        {blog ? (
          <EditBlogForm
            blog={blog}
            onCancel={() => setSearchParams({})}
            onSaved={() => setSearchParams({})}
          />
        ) : null}
      </SideDrawer>

      <DeleteBlogDialog
        open={pendingDelete !== null}
        blogId={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => setPendingDelete(null)}
      />
    </div>
  );
}
