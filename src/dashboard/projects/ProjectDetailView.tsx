import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import SideDrawer from "../components/SideDrawer";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";
import { PROJECT_NOT_FOUND_MESSAGE, asProjectId } from "./api";
import DeleteProjectDialog from "./DeleteProjectDialog";
import EditProjectForm from "./EditProjectForm";
import { useProjectDetail } from "./useProjectDetail";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}

export default function ProjectDetailView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useDashboard();
  const listPath = `/${ROLE_SLUG[role]}/projects`;
  const { project, loading, notFound, serverError, retry } = useProjectDetail(projectId);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const editing = searchParams.get("edit") === "1";

  return (
    <div>
      <PageHeader
        title={project?.title || "Project"}
        description="Review the portfolio project, then edit or delete it."
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton tone="ghost" onClick={() => navigate(listPath)}>
              Back to projects
            </ActionButton>
            {project ? (
              <>
                <ActionButton onClick={() => setSearchParams({ edit: "1" })}>
                  Edit
                </ActionButton>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700"
                  aria-label="Delete project"
                  onClick={() => {
                    const id = asProjectId(project.id);
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
          <p className="font-medium text-red-800">{PROJECT_NOT_FOUND_MESSAGE}</p>
          <div className="mt-4">
            <ActionButton onClick={() => navigate(listPath)}>Back to projects</ActionButton>
          </div>
        </div>
      ) : null}

      {!loading && serverError && !notFound ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </div>
      ) : null}

      {!loading && project ? (
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            {project.image ? (
              <img
                src={project.image}
                alt=""
                className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Project #{project.id}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#0F3952]">{project.title}</h2>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{project.details}</p>
        </article>
      ) : null}

      <SideDrawer
        open={Boolean(project) && editing}
        title={project ? `Edit project #${project.id}` : "Edit project"}
        description="Update title, image URL, and project details."
        onClose={() => setSearchParams({})}
      >
        {project ? (
          <EditProjectForm
            project={project}
            onCancel={() => setSearchParams({})}
            onSaved={() => setSearchParams({})}
          />
        ) : null}
      </SideDrawer>

      <DeleteProjectDialog
        open={pendingDelete !== null}
        projectId={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => setPendingDelete(null)}
      />
    </div>
  );
}
