import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { BLOG_NOT_FOUND_MESSAGE } from "./api";
import { useBlogDetail } from "./useBlogDetail";

export default function PublicBlogDetail() {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const { blog, loading, notFound, serverError, retry } = useBlogDetail(blogId, {
    publicFeed: true,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ActionButton tone="ghost" onClick={() => navigate("/blogs")}>
        Back to blog
      </ActionButton>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading article…
        </div>
      ) : null}

      {!loading && notFound ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-800">Article not found</h1>
          <p className="mt-2 text-sm text-red-700">{BLOG_NOT_FOUND_MESSAGE}</p>
        </div>
      ) : null}

      {!loading && serverError && !notFound ? (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </div>
      ) : null}

      {!loading && blog ? (
        <article className="mt-8">
          {blog.logo ? (
            <img
              src={blog.logo}
              alt=""
              className="mb-6 h-56 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
            Post #{blog.id}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0F3952]">{blog.title}</h1>
          <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-slate-700">
            {blog.details}
          </p>
        </article>
      ) : null}
    </div>
  );
}
