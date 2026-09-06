import { useRef, useState, type DragEvent } from "react";
import { Loader2, Upload, X } from "lucide-react";

import ActionButton from "../components/ActionButton";
import { Field, TextInput } from "../components/FormField";
import { ALLOWED_ACCEPT, formatFileSize, isAllowedFile, isImageMime } from "./api";
import type { UploadedFile } from "./types";
import { useFileManager } from "./useFileManager";

function FileCard({
  file,
  deleting,
  onDelete,
}: {
  file: UploadedFile;
  deleting: boolean;
  onDelete: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const image =
    !broken && Boolean(file.url) && isImageMime(file.mimetype, file.originalname || file.filename);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        className="absolute right-2 top-2 z-10 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50"
        aria-label={`Delete ${file.originalname || file.filename}`}
        disabled={deleting}
        onClick={onDelete}
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
      </button>
      {image ? (
        <img
          src={file.url}
          alt=""
          className="h-36 w-full rounded-xl object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl bg-[#0F3952] text-xs font-semibold uppercase tracking-[0.12em] text-[#FDC700]">
          {file.mimetype.split("/")[1] || "file"}
        </div>
      )}
      <h3 className="mt-3 truncate text-sm font-semibold text-[#0F3952]">
        {file.originalname || file.filename}
      </h3>
      <p className="mt-1 text-xs text-slate-500">{formatFileSize(file.size)}</p>
      <dl className="mt-2 space-y-0.5 text-[11px] leading-4 text-slate-500">
        <div className="truncate">
          <dt className="inline font-medium text-slate-600">Filename: </dt>
          <dd className="inline font-mono">{file.filename}</dd>
        </div>
        <div className="truncate">
          <dt className="inline font-medium text-slate-600">Type: </dt>
          <dd className="inline">{file.mimetype || "unknown"}</dd>
        </div>
        {file.url ? (
          <div className="truncate">
            <dt className="inline font-medium text-slate-600">URL: </dt>
            <dd className="inline">{file.url}</dd>
          </div>
        ) : null}
      </dl>
      {file.description ? (
        <p className="mt-2 line-clamp-2 text-xs text-slate-600">{file.description}</p>
      ) : null}
    </article>
  );
}

export default function FileUploadManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const {
    files,
    uploading,
    progress,
    deleting,
    authError,
    fieldErrors,
    addFile,
    removeFile,
    retry,
  } = useFileManager();

  const handleFiles = async (list: FileList | File[] | null) => {
    const incoming = list ? Array.from(list) : [];
    for (const file of incoming) {
      if (!isAllowedFile(file)) {
        await addFile(file, description);
        continue;
      }
      const uploaded = await addFile(file, description);
      if (!uploaded) {
        break;
      }
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (uploading) {
      return;
    }
    void handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {authError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>{authError}</p>
          <ActionButton onClick={() => void retry()} disabled={uploading || Boolean(deleting)}>
            Retry
          </ActionButton>
        </div>
      ) : null}

      <Field label="Description" error={fieldErrors.description}>
        <TextInput
          placeholder="Optional note stored with the next upload"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <div>
        <div
          role="button"
          tabIndex={uploading ? -1 : 0}
          aria-disabled={uploading}
          onClick={() => {
            if (!uploading) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (uploading) {
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploading) {
              setDragOver(true);
            }
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
            uploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          } ${
            dragOver
              ? "border-[#FDC700] bg-[#FDC700]/10"
              : "border-slate-300 bg-white hover:border-[#0F3952]/50"
          }`}
        >
          <Upload className="text-[#0F3952]" size={28} />
          <p className="mt-3 text-sm font-semibold text-[#0F3952]">
            Drop a file here or click to browse
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG, WebP, GIF, PDF, TXT, DOC/DOCX, XLS/XLSX, and CSV. Other types are blocked.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_ACCEPT}
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
        {fieldErrors.file ? (
          <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.file}</p>
        ) : null}
      </div>

      {uploading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-[#0F3952]">
            <span>Uploading…</span>
            <span>{progress > 0 ? `${progress}%` : ""}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#FDC700] transition-[width]"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
        </div>
      ) : null}

      {files.length === 0 && !uploading ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Uploaded files stay in this session only. After upload you will see a preview, size, and
          delete control.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <FileCard
              key={file.filename}
              file={file}
              deleting={deleting === file.filename}
              onDelete={() => void removeFile(file.filename)}
            />
          ))}
        </div>
      )}

      {files.length > 0 ? (
        <div className="flex justify-end">
          <ActionButton tone="ghost" onClick={() => inputRef.current?.click()} disabled={uploading}>
            Upload another
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}
