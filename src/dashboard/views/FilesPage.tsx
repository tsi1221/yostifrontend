import PageHeader from "../components/PageHeader";
import FileUploadManager from "../files/FileUploadManager";

export default function FilesPage() {
  return (
    <div>
      <PageHeader
        title="File library"
        description="Upload images and documents to the live files API, then remove them by system filename. There is no remote file list — this page keeps uploads in the current session only."
      />
      <FileUploadManager />
    </div>
  );
}
