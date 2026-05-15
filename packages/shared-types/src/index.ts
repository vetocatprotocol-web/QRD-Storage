export interface CreateUploadSessionDto {
  fileName: string;
  contentType: string;
  fileSize: number;
  checksum?: string;
}

export interface UploadSessionResponse {
  uploadUrl: string;
  authorizationToken: string;
  fileId: string;
  expiresAt: string;
  uploadSessionId?: string;
}

export interface VerifyUploadDto {
  uploadSessionId: string;
  b2FileId: string;
  encryptedSha1: string;
  plaintextChecksum?: string;
  encryptionSalt?: string;
  encryptionIv?: string;
  chunkCount?: number;
  chunkManifest?: string;
}

export interface SignedUploadUrl {
  uploadUrl: string;
  authorizationToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenDto {
  userId: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface DeviceRegistrationDto {
  name: string;
}

export interface DeviceRegistrationResponse {
  deviceId: string;
  deviceKey: string;
  name: string;
  createdAt: string;
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
