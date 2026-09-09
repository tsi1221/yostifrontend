import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { expireSession } from "../auth/sessionExpiry";
import {
  ALLOWED_ACCEPT,
  deleteFileByFilename,
  FileRequestError,
  uploadFile,
} from "./api";
import type { UploadedFile } from "./types";

const MAX_WORKFLOW_FILE_SIZE = 10 * 1024 * 1024;

interface WorkflowFileUploadProps {
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export default function WorkflowFileUpload({
  value,
  onChange,
  onUploadingChange,
  disabled = false,
  error,
}: WorkflowFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (file: File | undefined) => {
    if (!file || disabled || uploading || deleting) {
      return;
    }

    if (file.size > MAX_WORKFLOW_FILE_SIZE) {
      setMessage("Please choose a file smaller than 10 MB.");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    setMessage(null);
    try {
      const result = await uploadFile(
        { file, description: "Support ticket attachment" },
        setProgress,
      );
      onChange(result.record);
      if (value && value.filename !== result.record.filename) {
        try {
          await deleteFileByFilename(value.filename);
        } catch {
          setMessage("The new file is ready, but the previous file could not be removed.");
        }
      }
    } catch (cause) {
      if (cause instanceof FileRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }
      setMessage(
        cause instanceof FileRequestError
          ? cause.message
          : "We couldn't upload your file. Please try again.",
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      setProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!value || disabled || uploading || deleting) {
      return;
    }

    setDeleting(true);
    setMessage(null);
    try {
      await deleteFileByFilename(value.filename);
      onChange(null);
    } catch (cause) {
      if (cause instanceof FileRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }
      setMessage(
        cause instanceof Error ? cause.message : "Could not remove this file.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <div className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true">✓</span>
            <span className="min-w-0 truncate">{value.originalname || value.filename}</span>
          </div>
          <p className="mt-1 text-xs text-emerald-800">Upload complete</p>
          <div className="mt-2 flex gap-2">
            <label
              htmlFor="workflow-file-upload"
              className="cursor-pointer rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 focus-within:ring-2 focus-within:ring-[#0F3952] focus-within:ring-offset-1"
            >
              Replace
            </label>
            <button
              type="button"
              className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
              disabled={disabled || deleting}
              onClick={() => void handleRemove()}
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-center transition focus-within:border-[#0F3952] focus-within:ring-2 focus-within:ring-[#0F3952]/20">
          <Upload className="mx-auto text-[#0F3952]" size={20} aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[#0F3952]">Upload a supporting file</p>
          <label
            htmlFor="workflow-file-upload"
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0F3952] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0F3952]/90 focus-within:ring-2 focus-within:ring-[#FDC700] focus-within:ring-offset-2"
          >
            Choose a file
          </label>
          <p className="mt-2 text-xs text-slate-500">Click to browse and select a file</p>
          <p className="mt-1 text-xs text-slate-400">PDF, DOC, DOCX, JPG, PNG, or WebP</p>
          <p className="mt-1 text-xs text-slate-400">Maximum 10 MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        id="workflow-file-upload"
        aria-describedby={error || message ? "workflow-file-upload-error" : undefined}
        type="file"
        accept={ALLOWED_ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => {
          void handleUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {uploading ? (
        <div className="space-y-1 text-xs text-slate-500" role="status" aria-live="polite">
          <div className="flex justify-between">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-[#FDC700] transition-[width]" style={{ width: `${Math.max(progress, 8)}%` }} />
          </div>
        </div>
      ) : null}
      {error || message ? (
        <p id="workflow-file-upload-error" className="text-xs font-medium text-red-600" role="alert">
          {error || message}
        </p>
      ) : null}
      <p className="text-xs text-slate-400">Optional • PDF, Word documents, JPG, PNG, or WebP • Maximum 10 MB</p>
    </div>
  );
}