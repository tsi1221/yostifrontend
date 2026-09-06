import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import ProjectsTable from "../projects/ProjectsTable";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";

export default function ProjectsPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Search, page, edit, and delete portfolio projects."
        actions={
          <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/projects/new`)}>
            New project
          </ActionButton>
        }
      />
      <ProjectsTable />
    </div>
  );
}
