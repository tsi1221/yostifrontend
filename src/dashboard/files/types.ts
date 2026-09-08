export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  description: string;
}

export interface UploadFilePayload {
  file: File;
  description?: string;
}

export interface UploadFileResult {
  record: UploadedFile;
  message: string;
}

export interface DeleteFileResponse {
  message: string;
}

export type FileFieldErrors = Partial<
  Record<"file" | "description" | "filename", string>
>;

export type FileRequestFields = FileFieldErrors;

export interface FileErrorResponse {
  message?: string;
  fields?: FileFieldErrors;
}

export type FileUploadPhase = "idle" | "uploading" | "done" | "error";
