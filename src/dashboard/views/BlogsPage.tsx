import { useNavigate } from "react-router-dom";

import ActionButton from "../components/ActionButton";
import PageHeader from "../components/PageHeader";
import BlogsTable from "../blogs/BlogsTable";
import { ROLE_SLUG } from "../roles";
import { useDashboard } from "../store";

export default function BlogsPage() {
  const { role } = useDashboard();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Search, page, edit, and delete published articles."
        actions={
          <ActionButton onClick={() => navigate(`/${ROLE_SLUG[role]}/blogs/new`)}>
            New post
          </ActionButton>
        }
      />
      <BlogsTable />
    </div>
  );
}
