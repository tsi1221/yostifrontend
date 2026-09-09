import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import ProjectsTable from "../projects/ProjectsTable";
import { dashboardPath } from "../roles";
import { useDashboard } from "../store";

export default function ProjectsPage() {
  useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Search, page, edit, and delete portfolio projects."
        actions={
          <ActionButton
            onClick={() => navigate(`${dashboardPath("projects")}/new`)}
          >
            New project
          </ActionButton>
        }
      />
      <ProjectsTable />
    </div>
  );
}
