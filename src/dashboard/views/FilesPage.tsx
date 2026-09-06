import PageHeader from "../components/PageHeader";
import FileUploadManager from "../files/FileUploadManager";

export default function FilesPage() {
  return (
    <div>
      <PageHeader
        title="File Library"
        description="Manage and upload files for use across the Yosti Trading platform."
      />
      <FileUploadManager />
    </div>
  );
}
