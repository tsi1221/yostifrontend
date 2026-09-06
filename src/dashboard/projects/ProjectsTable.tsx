import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { SelectInput, TextInput } from "../components/FormField";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import { asProjectId, snippet } from "./api";
import DeleteProjectDialog from "./DeleteProjectDialog";
import EditProjectForm from "./EditProjectForm";
import ProjectEmptyState from "./ProjectEmptyState";
import type { ProjectRecord } from "./types";
import { useProjectsList } from "./useProjectsList";

const COLUMNS = 5;

function rangeLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "Showing 0 of 0";
  }
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}-${end} of ${total}`;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }, (_, row) => (
        <tr key={`skeleton-${row}`}>
          {Array.from({ length: COLUMNS }, (_, cell) => (
            <td key={cell} className="px-4 py-3">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ProjectsTable() {
  const navigate = useNavigate();
  const { role } = useDashboard();
  const createPath = `/${ROLE_SLUG[role]}/projects/new`;
  const {
    filters,
    setFilter,
    setPage,
    setPageSize,
    projects,
    meta,
    loading,
    serverError,
    retry,
  } = useProjectsList();
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const detailPath = (id: number) => `/${ROLE_SLUG[role]}/projects/${id}`;
  const filtersEmpty = !filters.search.trim() && !filters.title.trim();
  const showFirstEmpty = !loading && !serverError && meta.total === 0 && filtersEmpty;

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Global search
          </span>
          <TextInput
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            placeholder="Search projects"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Title
          </span>
          <TextInput
            value={filters.title}
            onChange={(event) => setFilter("title", event.target.value)}
            placeholder="Filter by title"
          />
        </label>
      </section>

      {serverError && !loading ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </section>
      ) : null}

      {showFirstEmpty ? (
        <ProjectEmptyState onAction={() => navigate(createPath)} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <SkeletonRows /> : null}
                {!loading && projects.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS} className="px-4 py-10 text-center text-slate-500">
                      No projects match these filters.
                    </td>
                  </tr>
                ) : null}
                {!loading
                  ? projects.map((project) => (
                      <tr
                        key={project.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => navigate(detailPath(project.id))}
                      >
                        <td className="px-4 py-3 font-medium text-[#0F3952]">{project.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#0F3952]">{project.title}</td>
                        <td className="px-4 py-3">
                          {project.image ? (
                            <img
                              src={project.image}
                              alt=""
                              className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          {snippet(project.details, 90) || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ActionButton
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditing(project);
                              }}
                            >
                              Edit
                            </ActionButton>
                            <button
                              type="button"
                              className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                              aria-label={`Delete project ${project.id}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                const id = asProjectId(project.id);
                                if (id !== undefined) {
                                  setPendingDelete(id);
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
          <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
                <option value="50">50 / page</option>
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
      )}

      <SideDrawer
        open={Boolean(editing)}
        title={editing ? `Edit project #${editing.id}` : "Edit project"}
        description="Update title, image URL, and project details."
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <EditProjectForm
            project={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => setEditing(null)}
          />
        ) : null}
      </SideDrawer>

      <DeleteProjectDialog
        open={pendingDelete !== null}
        projectId={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => {
          if (editing && pendingDelete !== null && editing.id === pendingDelete) {
            setEditing(null);
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
