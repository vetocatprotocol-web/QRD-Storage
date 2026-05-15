import { Injectable } from '@nestjs/common';
import { env } from 'process';
import { CreateUploadSessionDto, UploadSessionResponse, SignedUploadUrl } from '@qrd/shared-types';
import { BackblazeB2Client } from '@qrd/storage-sdk';
import { PrismaService } from '../prisma/prisma.service.js';
import { VerifyUploadDto } from './dto/verify-upload.dto.js';

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

    // Do NOT persist Backblaze authorizationToken. It is short-lived and must not be stored.
    const uploadSession = await this.prisma.uploadSession.create({
      data: {
        userId,
        fileId: file.id,
        uploadUrl: signedUrl.uploadUrl,
        expiresAt,
      },
    });

    return {
      uploadUrl: signedUrl.uploadUrl,
      authorizationToken: signedUrl.authorizationToken,
      fileId: file.id,
      expiresAt: expiresAt.toISOString(),
      uploadSessionId: uploadSession.id,
    } as UploadSessionResponse;
  }

  async verifyUploadSession(userId: string, payload: VerifyUploadDto) {
    const session = await this.prisma.uploadSession.findUnique({ where: { id: payload.uploadSessionId }, include: { file: true } });
    if (!session) {
      throw new Error('Upload session not found');
    }
    if (session.userId !== userId) {
      throw new Error('Not authorized for this upload session');
    }
    if (session.expiresAt < new Date()) {
      throw new Error('Upload session expired');
    }

    const b2Client = new BackblazeB2Client({
      accountId: env.B2_ACCOUNT_ID ?? '',
      applicationKey: env.B2_APPLICATION_KEY ?? '',
      bucketId: env.B2_BUCKET_ID ?? '',
    });

    // Fetch file info from Backblaze to verify existence and SHA1
    const fileInfo = await b2Client.getFileInfoById(payload.b2FileId);
    if (!fileInfo) throw new Error('Uploaded file not found in Backblaze');

    // Verify size
    const contentLength = Number(fileInfo.size || 0);
    if (session.file && BigInt(session.file.fileSize) !== BigInt(contentLength)) {
      // size mismatch
      await this.prisma.file.update({ where: { id: session.file!.id }, data: { verificationState: 'FAILED' } });
      throw new Error('Uploaded file size mismatch');
    }

    // Compare B2's SHA1 with client-provided encryptedSha1
    if (fileInfo.contentSha1 !== payload.encryptedSha1) {
      await this.prisma.file.update({ where: { id: session.file!.id }, data: { verificationState: 'FAILED' } });
      throw new Error('Uploaded file checksum mismatch');
    }

    // Persist verification metadata on File record (not storing raw secrets beyond required metadata)
    if (session.file) {
      await this.prisma.file.update({
        where: { id: session.file.id },
        data: {
          b2ObjectId: payload.b2FileId,
          encryptedChecksum: payload.encryptedSha1 ?? null,
            plaintextChecksum: payload.plaintextChecksum ?? null,
            encryptionSalt: payload.encryptionSalt ?? null,
            encryptionIv: payload.encryptionIv ?? null,
            encryptedFileKey: payload.encryptedFileKey ?? null,
          chunkCount: payload.chunkCount ?? null,
          verificationState: 'VERIFIED',
          fileSize: BigInt(contentLength),
        },
      });
    }

    // Optionally remove or expire the upload session to prevent replay
    await this.prisma.uploadSession.delete({ where: { id: session.id } });

    return { status: 'ok' };
  }

  async startMultipartSession(userId: string, payload: { fileName: string; contentType: string }) {
    const b2Client = new BackblazeB2Client({ accountId: env.B2_ACCOUNT_ID ?? '', applicationKey: env.B2_APPLICATION_KEY ?? '', bucketId: env.B2_BUCKET_ID ?? '' });
    const res = await b2Client.startLargeFile(payload.fileName, payload.contentType ?? 'application/octet-stream');
    const file = await this.prisma.file.create({
      data: {
        userId,
        fileName: payload.fileName,
        contentType: payload.contentType,
        fileSize: 0,
        status: 'pending',
      },
    });
    const uploadSession = await this.prisma.uploadSession.create({ data: { userId, fileId: file.id, uploadUrl: '', expiresAt: new Date(Date.now() + 1000 * 60 * 60) } });
    return { fileId: res.fileId, uploadSessionId: uploadSession.id, dbFileId: file.id };
  }

  async getPartUploadUrl(userId: string, fileId: string) {
    const b2Client = new BackblazeB2Client({ accountId: env.B2_ACCOUNT_ID ?? '', applicationKey: env.B2_APPLICATION_KEY ?? '', bucketId: env.B2_BUCKET_ID ?? '' });
    const url = await b2Client.getUploadPartUrl(fileId);
    return { uploadUrl: url.uploadUrl, authorizationToken: url.authorizationToken };
  }

  async finishMultipart(userId: string, payload: { fileId: string; partSha1Array: string[] }) {
    const b2Client = new BackblazeB2Client({ accountId: env.B2_ACCOUNT_ID ?? '', applicationKey: env.B2_APPLICATION_KEY ?? '', bucketId: env.B2_BUCKET_ID ?? '' });
    const finish = await b2Client.finishLargeFile(payload.fileId, payload.partSha1Array);
    return finish;
  }
}
