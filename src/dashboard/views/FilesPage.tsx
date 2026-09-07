import PageHeader from "../components/PageHeader";
import FileUploadManager from "../files/FileUploadManager";

export default function FilesPage() {
  return (
    <div>
      <PageHeader
        title="File Library"
        description="Upload documents for use across the trading workspace."
      />
      <FileUploadManager />
    </div>
  );
}
