import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import { useProjectDetail } from "./useProjectDetail";

export default function PublicProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { project, loading, notFound, serverError, retry } = useProjectDetail(projectId, {
    publicFeed: true,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ActionButton tone="ghost" onClick={() => navigate("/projects")}>
        Back to projects
      </ActionButton>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading project…
        </div>
      ) : null}

      {!loading && notFound ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-800">Project Not Found</h1>
          <p className="mt-2 text-sm text-red-700">
            This project could not be found or has been removed.
          </p>
        </div>
      ) : null}

      {!loading && serverError && !notFound ? (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{serverError}</p>
          <ActionButton onClick={retry}>Retry</ActionButton>
        </div>
      ) : null}

      {!loading && project ? (
        <article className="mt-8">
          {project.image ? (
            <img
              src={project.image}
              alt=""
              className="mb-6 h-56 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FDC700]">
            Project #{project.id}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0F3952]">{project.title}</h1>
          <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-slate-700">
            {project.details}
          </p>
        </article>
      ) : null}
    </div>
  );
}
