export interface CreateUploadSessionDto {
  fileName: string;
  contentType: string;
  fileSize: number;
  checksum?: string;
}

export interface UploadSessionResponse {
  uploadUrl: string;
  fileId: string;
  expiresAt: string;
}
