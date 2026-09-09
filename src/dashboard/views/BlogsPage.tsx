import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import BlogsTable from "../blogs/BlogsTable";
import { dashboardPath } from "../roles";
import { useDashboard } from "../store";

export default function BlogsPage() {
  useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Search, page, edit, and delete published articles."
        actions={
          <ActionButton
            onClick={() => navigate(`${dashboardPath("blogs")}/new`)}
          >
            New post
          </ActionButton>
        }
      />
      <BlogsTable />
    </div>
  );
}
