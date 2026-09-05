import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { dashboardSnapshot } from "../data";
import type { BlogPost, Project } from "../types";

export function BlogsPage() {
  return (
    <div>
      <PageHeader title="Blogs" description="Published and draft articles." />
      <DataTable<BlogPost>
        rows={dashboardSnapshot.blogs}
        rowKey={(row) => row.id}
        empty="No posts yet."
        columns={[
          { header: "Title", render: (row) => row.title },
          { header: "Author", render: (row) => row.author },
          { header: "Published", render: (row) => row.publishedAt ?? "—" },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}

export function ProjectsPage() {
  return (
    <div>
      <PageHeader title="Projects" description="Public case studies and corridor work." />
      <DataTable<Project>
        rows={dashboardSnapshot.projects}
        rowKey={(row) => row.id}
        empty="No projects yet."
        columns={[
          { header: "Project", render: (row) => row.title },
          { header: "Country", render: (row) => row.country },
          { header: "Year", render: (row) => String(row.year) },
          { header: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
      />
    </div>
  );
}
