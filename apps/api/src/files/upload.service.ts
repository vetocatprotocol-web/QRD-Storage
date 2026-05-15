import { Injectable } from '@nestjs/common';
import { env } from 'process';
import { CreateUploadSessionDto, UploadSessionResponse } from './upload.dto.js';
import { BackblazeB2Client } from '@qrd/storage-sdk';

@Injectable()
export class UploadService {
  async createUploadSession(payload: CreateUploadSessionDto): Promise<UploadSessionResponse> {
    const b2Client = new BackblazeB2Client({
      accountId: env.B2_ACCOUNT_ID ?? '',
      applicationKey: env.B2_APPLICATION_KEY ?? '',
      bucketId: env.B2_BUCKET_ID ?? '',
    });

    const uploadUrl = await b2Client.generateUploadUrl(payload.fileName, payload.contentType);

    return {
      uploadUrl,
      fileId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    };
  }
}
