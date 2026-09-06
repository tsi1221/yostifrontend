import { AUTH_API_BASE, FILES_UPLOAD_URL, FILES_URL } from "../auth/endpoints";
import { getAccessToken } from "../auth/session";
import { isPreviewAccessToken } from "../users/usersService";
import type {
  DeleteFileResponse,
  FileFieldErrors,
  UploadFilePayload,
  UploadFileResult,
  UploadedFile,
} from "./types";

export { isPreviewAccessToken };

export class FileRequestError extends Error {
  status: number;
  fields?: FileFieldErrors;
  code?: "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "NETWORK";

  constructor(
    message: string,
    status: number,
    fields?: FileFieldErrors,
    code?: FileRequestError["code"]
  ) {
    super(message);
    this.name = "FileRequestError";
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

export const FILES_INVALIDATE_EVENT = "yosti:files-invalidate";
export const FILE_MISSING_MESSAGE = "Choose a file to upload.";
export const FILE_NOT_FOUND_MESSAGE = "File not found or couldn't be deleted.";
export const FILE_INVALID_FORMAT_MESSAGE = "Invalid file format.";
export const FILE_UPLOAD_SUCCESS_MESSAGE = "File uploaded successfully.";

export const ALLOWED_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,.doc,.docx,.xls,.xlsx,.csv";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
]);

const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
]);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const FIELD_KEYS: Array<keyof FileFieldErrors> = ["file", "description", "filename"];

export function invalidateFilesCache() {
  window.dispatchEvent(new CustomEvent(FILES_INVALIDATE_EVENT));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) {
      return number;
    }
  }
  return undefined;
}

function readApiMessage(raw: unknown, fallback: string) {
  const record = asRecord(raw);
  const message = record?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (Array.isArray(message)) {
    const text = message.filter((item) => typeof item === "string").join(", ");
    if (text) {
      return text;
    }
  }
  return fallback;
}

function parseFieldErrors(raw: unknown): FileFieldErrors {
  const record = asRecord(raw);
  const fields: FileFieldErrors = {};
  const nested = asRecord(record?.fields) ?? asRecord(record?.errors) ?? asRecord(record?.message);

  if (nested) {
    for (const key of Object.keys(nested)) {
      if (FIELD_KEYS.includes(key as keyof FileFieldErrors)) {
        const value = pickString(nested[key]);
        if (value) {
          fields[key as keyof FileFieldErrors] = value;
        }
      }
    }
  }

  return fields;
}

export function fileExtension(name: string) {
  return name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
}

export function isAllowedFile(file: File) {
  return ALLOWED_MIME.has(file.type) || ALLOWED_EXT.has(fileExtension(file.name));
}

export function isImageMime(mimetype: string, filename = "") {
  return mimetype.startsWith("image/") || IMAGE_EXT.has(fileExtension(filename));
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileDeleteUrl(filename: string) {
  return `${FILES_URL}/${encodeURIComponent(filename)}`;
}

export function resolveFileUrl(url: string) {
  const value = url.trim();
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const origin = AUTH_API_BASE.replace(/\/api\/?$/, "");
  return value.startsWith("/") ? `${origin}${value}` : `${origin}/${value}`;
}

export function normalizeUploadedFile(raw: unknown): UploadedFile | null {
  const record = asRecord(raw);
  if (!record) {
    return null;
  }

  const filename = pickString(record.filename, record.name, record.key);
  const url = pickString(record.url, record.path, record.location);
  if (!filename && !url) {
    return null;
  }

  const resolved = resolveFileUrl(url);

  return {
    filename: filename || resolved.split("/").pop() || "file",
    originalname: pickString(record.originalname, record.originalName, record.original_name, filename),
    mimetype: pickString(record.mimetype, record.mimeType, record.mime_type, record.type),
    size: pickNumber(record.size, record.bytes) ?? 0,
    url: resolved,
    description: pickString(record.description),
  };
}

function requireToken() {
  const token = getAccessToken();
  if (!token) {
    throw new FileRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  return token;
}

export function uploadFile(
  payload: UploadFilePayload,
  onProgress?: (percent: number) => void
): Promise<UploadFileResult> {
  if (!payload.file) {
    return Promise.reject(
      new FileRequestError(FILE_MISSING_MESSAGE, 400, { file: FILE_MISSING_MESSAGE }, "VALIDATION")
    );
  }
  if (!isAllowedFile(payload.file)) {
    return Promise.reject(
      new FileRequestError(
        FILE_INVALID_FORMAT_MESSAGE,
        400,
        { file: "This file type is not allowed." },
        "VALIDATION"
      )
    );
  }

  const token = requireToken();
  const body = new FormData();
  body.append("file", payload.file, payload.file.name);
  if (payload.description?.trim()) {
    body.append("description", payload.description.trim());
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", FILES_UPLOAD_URL);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onerror = () => {
      reject(
        new FileRequestError(
          "Unable to reach the server. Check your connection and try again.",
          0,
          undefined,
          "NETWORK"
        )
      );
    };

    xhr.onload = () => {
      const raw: unknown = (() => {
        try {
          return xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          return null;
        }
      })();

      if (xhr.status === 400) {
        const fields = parseFieldErrors(raw);
        const message = readApiMessage(raw, "Invalid file format or missing required payload.");
        if (!fields.file && !fields.description) {
          fields.file = message;
        }
        reject(new FileRequestError(message, 400, fields, "VALIDATION"));
        return;
      }
      if (xhr.status === 401) {
        reject(new FileRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED"));
        return;
      }
      if (xhr.status !== 200 && xhr.status !== 201) {
        reject(
          new FileRequestError(
            readApiMessage(raw, "Server error occurred. Could not upload this file."),
            xhr.status
          )
        );
        return;
      }

      const record =
        normalizeUploadedFile(raw) ??
        normalizeUploadedFile(asRecord(raw)?.data) ??
        normalizeUploadedFile(asRecord(raw)?.file);
      if (!record) {
        reject(new FileRequestError("The server returned an incomplete file record.", 500));
        return;
      }

      invalidateFilesCache();
      resolve({
        record,
        message: readApiMessage(raw, FILE_UPLOAD_SUCCESS_MESSAGE),
      });
    };

    xhr.send(body);
  });
}

export async function deleteFileByFilename(filename: string): Promise<DeleteFileResponse> {
  const token = requireToken();
  const name = filename.trim();
  if (!name) {
    throw new FileRequestError(FILE_NOT_FOUND_MESSAGE, 400, { filename: FILE_NOT_FOUND_MESSAGE }, "VALIDATION");
  }

  let response: Response;
  try {
    response = await fetch(fileDeleteUrl(name), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new FileRequestError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      undefined,
      "NETWORK"
    );
  }

  const raw: unknown = await response.json().catch(() => null);

  if (response.status === 400 || response.status === 404) {
    throw new FileRequestError(
      readApiMessage(raw, FILE_NOT_FOUND_MESSAGE),
      response.status,
      { filename: readApiMessage(raw, FILE_NOT_FOUND_MESSAGE) },
      "NOT_FOUND"
    );
  }
  if (response.status === 401) {
    throw new FileRequestError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
  if (response.status !== 200) {
    throw new FileRequestError(
      readApiMessage(raw, "Server error occurred. Could not delete this file."),
      response.status
    );
  }

  invalidateFilesCache();
  return {
    message: readApiMessage(raw, `File '${name}' successfully deleted.`),
  };
}
