import { useRef, useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import { clearAuthSession, getAccessToken } from "../auth/session";
import type { FileFieldErrors, UploadedFile } from "./types";
import {
  FILE_INVALID_FORMAT_MESSAGE,
  FILE_UPLOAD_SUCCESS_MESSAGE,
  FileRequestError,
  deleteFileByFilename,
  isAllowedFile,
  isPreviewAccessToken,
  uploadFile,
} from "./api";

type PendingAction =
  | { kind: "upload"; files: File[]; description?: string }
  | { kind: "delete"; filename: string };

const UPLOAD_CONCURRENCY = 3;
const PREVIEW_AUTH_MESSAGE = "Sign in with a live account to manage files.";

export function useFileManager() {
  const navigate = useNavigate();
  const pendingRef = useRef<PendingAction | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FileFieldErrors>({});

  const handleAuth = (cause: unknown) => {
    if (cause instanceof FileRequestError && cause.status === 401) {
      if (isPreviewAccessToken(getAccessToken())) {
        setAuthError(PREVIEW_AUTH_MESSAGE);
        message.error(PREVIEW_AUTH_MESSAGE);
        return true;
      }
      clearAuthSession();
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  };

  const addFiles = async (incoming: File[], description?: string) => {
    pendingRef.current = { kind: "upload", files: incoming, description };

    const blocked = incoming.filter((file) => !isAllowedFile(file));
    const allowed = incoming.filter((file) => isAllowedFile(file));

    if (blocked.length > 0) {
      setFieldErrors({ file: "This file type is not allowed." });
      message.error(FILE_INVALID_FORMAT_MESSAGE);
    }

    if (allowed.length === 0) {
      return [];
    }

    setUploading(true);
    setProgress(0);
    setAuthError(null);
    if (blocked.length === 0) {
      setFieldErrors({});
    }

    const progresses = allowed.map(() => 0);
    let stopped = false;
    let uploadedCount = 0;
    let cursor = 0;

    const uploadOne = async (file: File, index: number) => {
      if (stopped) {
        return null;
      }

      try {
        const uploaded = await uploadFile({ file, description }, (percent) => {
          progresses[index] = percent;
          const total = progresses.reduce((sum, value) => sum + value, 0);
          setProgress(Math.round(total / Math.max(allowed.length, 1)));
        });
        setFiles((current) => [
          uploaded.record,
          ...current.filter((item) => item.filename !== uploaded.record.filename),
        ]);
        uploadedCount += 1;
        return uploaded.record;
      } catch (cause) {
        if (cause instanceof FileRequestError && cause.status === 400) {
          setFieldErrors(cause.fields ?? { file: cause.message });
          message.error(cause.message);
          return null;
        }
        if (handleAuth(cause)) {
          stopped = true;
          return null;
        }
        message.error(
          cause instanceof Error ? cause.message : "Could not upload this file."
        );
        return null;
      }
    };

    const workers = Array.from(
      { length: Math.min(UPLOAD_CONCURRENCY, allowed.length) },
      async () => {
        while (cursor < allowed.length && !stopped) {
          const index = cursor;
          cursor += 1;
          await uploadOne(allowed[index], index);
        }
      }
    );

    try {
      await Promise.all(workers);
      if (uploadedCount === 1) {
        message.success(FILE_UPLOAD_SUCCESS_MESSAGE);
        pendingRef.current = null;
      } else if (uploadedCount > 1) {
        message.success(`${uploadedCount} files uploaded successfully.`);
        pendingRef.current = null;
      }
      return allowed.slice(0, uploadedCount);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const addFile = (file: File, description?: string) => addFiles([file], description);

  const removeFile = async (filename: string) => {
    pendingRef.current = { kind: "delete", filename };
    setDeleting(filename);
    setAuthError(null);

    let removed: UploadedFile | undefined;
    setFiles((current) => {
      removed = current.find((item) => item.filename === filename);
      return current.filter((item) => item.filename !== filename);
    });

    try {
      const result = await deleteFileByFilename(filename);
      pendingRef.current = null;
      message.success(result.message);
      return true;
    } catch (cause) {
      if (removed) {
        const restored = removed;
        setFiles((current) =>
          current.some((item) => item.filename === restored.filename)
            ? current
            : [restored, ...current]
        );
      }
      if (handleAuth(cause)) {
        return false;
      }
      if (cause instanceof FileRequestError && cause.status === 400) {
        setFieldErrors(cause.fields ?? { filename: cause.message });
      }
      message.error(cause instanceof Error ? cause.message : "Could not delete this file.");
      return false;
    } finally {
      setDeleting(null);
    }
  };

  const retry = async () => {
    const pending = pendingRef.current;
    if (!pending) {
      return;
    }
    if (pending.kind === "upload") {
      await addFiles(pending.files, pending.description);
      return;
    }
    await removeFile(pending.filename);
  };

  return {
    files,
    uploading,
    progress,
    deleting,
    authError,
    fieldErrors,
    addFile,
    addFiles,
    removeFile,
    retry,
  };
}
