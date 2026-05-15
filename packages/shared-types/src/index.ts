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

export interface SignedUploadUrl {
  uploadUrl: string;
  authorizationToken: string;
}

export interface FileMetadata {
  fileId: string;
  userId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}
