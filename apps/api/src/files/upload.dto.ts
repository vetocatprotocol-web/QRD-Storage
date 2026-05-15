import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateUploadSessionDto {
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @IsNotEmpty()
  @IsString()
  contentType!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fileSize!: number;

  @IsOptional()
  @IsString()
  checksum?: string;
}

export class UploadSessionResponse {
  uploadUrl!: string;
  authorizationToken!: string;
  fileId!: string;
  expiresAt!: string;
  uploadSessionId?: string;
}
