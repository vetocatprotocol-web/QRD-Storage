import { Injectable } from '@nestjs/common';
import { env } from 'process';
import { CreateUploadSessionDto, UploadSessionResponse, SignedUploadUrl } from '@qrd/shared-types';
import { BackblazeB2Client } from '@qrd/storage-sdk';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  async createUploadSession(userId: string, payload: CreateUploadSessionDto): Promise<UploadSessionResponse> {
    const b2Client = new BackblazeB2Client({
      accountId: env.B2_ACCOUNT_ID ?? '',
      applicationKey: env.B2_APPLICATION_KEY ?? '',
      bucketId: env.B2_BUCKET_ID ?? '',
    });

    const signedUrl = await b2Client.generateUploadUrl(payload.fileName, payload.contentType);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

    const file = await this.prisma.file.create({
      data: {
        userId,
        fileName: payload.fileName,
        contentType: payload.contentType,
        fileSize: payload.fileSize,
        status: 'pending',
      },
    });

    await this.prisma.uploadSession.create({
      data: {
        userId,
        fileId: file.id,
        uploadUrl: signedUrl.uploadUrl,
        authorizationToken: signedUrl.authorizationToken,
        expiresAt,
      },
    });

    return {
      uploadUrl: signedUrl.uploadUrl,
      authorizationToken: signedUrl.authorizationToken,
      fileId: file.id,
      expiresAt: expiresAt.toISOString(),
    } as UploadSessionResponse;
  }
}
