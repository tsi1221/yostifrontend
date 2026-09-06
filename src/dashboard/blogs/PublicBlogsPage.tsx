import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import { snippet } from "./api";
import BlogEmptyState from "./BlogEmptyState";
import { useBlogsList } from "./useBlogsList";

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

export default function PublicBlogsPage() {
  const navigate = useNavigate();
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    blogs,
    meta,
    loading,
    serverError,
    retry,
  } = useBlogsList({ publicFeed: true });

  const filtersEmpty = !filters.search.trim() && !filters.title.trim();
  const showFirstEmpty = !loading && !serverError && meta.total === 0 && filtersEmpty;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#0F3952]">Blog</h1>
        <p className="mt-2 text-sm text-slate-500">
          Trade notes, factory visits, and sourcing stories from the Yosti desk.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <TextInput
          value={filters.search}
          onChange={(event) => setFilter("search", event.target.value)}
          placeholder="Search articles"
        />
        <TextInput
          value={filters.title}
          onChange={(event) => setFilter("title", event.target.value)}
          placeholder="Filter by title"
        />
      </section>

      {serverError && !loading ? (
        <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : null}

      {showFirstEmpty ? (
        <BlogEmptyState
          description="No articles have been published yet."
          onAction={() => navigate("/superadmin/blogs/new")}
        />
      ) : null}

      {!loading && !showFirstEmpty ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {blogs.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
              No articles match these filters.
            </p>
          ) : (
            blogs.map((blog) => (
              <button
                key={blog.id}
                type="button"
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#0F3952]/40"
                onClick={() => navigate(`/blogs/${blog.id}`)}
              >
                {blog.logo ? (
                  <img
                    src={blog.logo}
                    alt=""
                    className="mb-3 h-28 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-3 h-28 rounded-xl bg-[#0F3952]" />
                )}
                <h2 className="text-lg font-semibold text-[#0F3952]">{blog.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{snippet(blog.details)}</p>
              </button>
            ))
          )}
        </div>
      ) : null}

      <footer className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {rangeLabel(meta.page, meta.pageSize, meta.total)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <SelectInput
            value={String(filters.pageSize)}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="w-auto"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
          </SelectInput>
          <ActionButton
            tone="ghost"
            disabled={meta.page <= 1 || loading}
            onClick={() => setPage(meta.page - 1)}
          >
            Previous
          </ActionButton>
          <span className="px-2 text-sm font-medium text-[#0F3952]">
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <ActionButton
            disabled={meta.page >= meta.totalPages || loading}
            onClick={() => setPage(meta.page + 1)}
          >
            Next
          </ActionButton>
        </div>
      </footer>
    </div>
  );
}
