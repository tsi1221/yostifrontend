import { useRef, useState } from "react";
import { Image, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { expireSession } from "../auth/sessionExpiry";
import {
  deleteFileByFilename,
  FileRequestError,
  uploadFile,
} from "../files/api";
import type { UploadedFile } from "../files/types";

const MAX_LOGO_SIZE = 10 * 1024 * 1024;
const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const LOGO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const LOGO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface LogoImageUploadProps {
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  description?: string;
  inputId?: string;
  deletePreviousOnReplace?: boolean;
  deleteOnRemove?: boolean;
  disabled?: boolean;
  error?: string;
}

function extension(name: string) {
  return name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
}

function isSupportedLogo(file: File) {
  return LOGO_MIME_TYPES.has(file.type) || LOGO_EXTENSIONS.has(extension(file.name));
}

function friendlyUploadError(cause: unknown) {
  if (cause instanceof FileRequestError) {
    if (cause.status >= 500 || cause.status === 0) {
      return "We couldn't connect to the upload service. Please check your connection and try again.";
    }
    if (cause.status === 400) {
      return "Please upload a PNG, JPG, JPEG, or WebP image.";
    }
    return cause.message;
  }
  return "We couldn't upload the logo. Please try again.";
}

export default function LogoImageUpload({
  value,
  onChange,
  onUploadingChange,
  description = "Service logo",
  inputId = "service-logo-upload",
  deletePreviousOnReplace = true,
  deleteOnRemove = true,
  disabled = false,
  error,
}: LogoImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const setUploadState = (next: boolean) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file || disabled || uploading || removing) {
      return;
    }
    setMessage(null);
    if (!isSupportedLogo(file)) {
      setMessage("Please upload a PNG, JPG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setMessage("Please choose an image smaller than 10 MB.");
      return;
    }

    setUploadState(true);
    setProgress(0);
    try {
      const result = await uploadFile(
        { file, description },
        setProgress,
      );
      const previous = value;
      onChange(result.record);
      if (
        deletePreviousOnReplace &&
        previous &&
        previous.filename !== result.record.filename
      ) {
        try {
          await deleteFileByFilename(previous.filename);
        } catch {
          setMessage("The new logo is ready, but the previous image could not be removed.");
        }
      }
    } catch (cause) {
      if (cause instanceof FileRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }
      setMessage(friendlyUploadError(cause));
    } finally {
      setUploadState(false);
      setProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!value || disabled || uploading || removing) {
      return;
    }
    setRemoving(true);
    setMessage(null);
    try {
      if (deleteOnRemove) {
        await deleteFileByFilename(value.filename);
      }
      onChange(null);
    } catch (cause) {
      if (cause instanceof FileRequestError && cause.status === 401) {
        expireSession(navigate);
        return;
      }
      setMessage("We couldn't remove the logo. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
          <div className="flex items-center gap-3">
            <img
              src={value.url}
              alt="Uploaded service logo preview"
              className="h-16 w-16 rounded-lg border border-emerald-200 bg-white object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span aria-hidden="true">✓</span>
                <span className="truncate">{value.originalname || value.filename}</span>
              </p>
              <p className="mt-1 text-xs text-emerald-800">Upload complete</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <label
              htmlFor={inputId}
              className="cursor-pointer rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-emerald-100 focus-within:ring-2 focus-within:ring-[#0F3952] focus-within:ring-offset-1"
            >
              Replace image
            </label>
            <button
              type="button"
              disabled={disabled || removing}
              onClick={() => void handleRemove()}
              className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
            >
              {removing ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-5 text-center transition focus-within:border-[#0F3952] focus-within:ring-2 focus-within:ring-[#0F3952]/20">
          <Image className="mx-auto text-[#0F3952]" size={22} aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-[#0F3952]">Upload logo</p>
          <label
            htmlFor={inputId}
            className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0F3952] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0F3952]/90 focus-within:ring-2 focus-within:ring-[#FDC700] focus-within:ring-offset-2"
          >
            <Upload size={16} aria-hidden="true" />
            Choose an image
          </label>
          <p className="mt-2 text-xs text-slate-500">Click to browse and select an image</p>
        </div>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        disabled={disabled || uploading}
        aria-describedby={error || message ? "service-logo-upload-error" : "service-logo-upload-help"}
        onChange={(event) => {
          void handleUpload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {uploading ? (
        <div className="space-y-1 text-xs text-slate-500" role="status" aria-live="polite">
          <div className="flex justify-between">
            <span>Uploading logo...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-[#FDC700] transition-[width]" style={{ width: `${Math.max(progress, 8)}%` }} />
          </div>
        </div>
      ) : null}
      {error || message ? (
        <p id="service-logo-upload-error" className="text-xs font-medium text-red-600" role="alert">
          {message ? <><strong className="block">{message.includes("smaller") ? "Image is too large" : "Upload failed"}</strong>{message}</> : error}
        </p>
      ) : null}
      <p id="service-logo-upload-help" className="text-xs text-slate-400">PNG, JPG, JPEG, or WebP • Maximum 10 MB</p>
    </div>
  );
}