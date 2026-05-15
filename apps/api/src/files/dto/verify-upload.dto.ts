import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class VerifyUploadDto {
  @IsNotEmpty()
  @IsString()
  uploadSessionId!: string;

  @IsNotEmpty()
  @IsString()
  b2FileId!: string;

  @IsNotEmpty()
  @IsString()
  encryptedSha1!: string; // Must be SHA1 of the encrypted blob (Backblaze contentSha1)

  @IsOptional()
  @IsString()
  plaintextChecksum?: string;

  @IsOptional()
  @IsString()
  encryptionSalt?: string;

  @IsOptional()
  @IsString()
  encryptionIv?: string;

  @IsOptional()
  @IsString()
  encryptedFileKey?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  chunkCount?: number;

  @IsOptional()
  @IsString()
  chunkManifest?: string; // JSON stringified manifest
}
