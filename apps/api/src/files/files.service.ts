import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BackblazeB2Client } from '@qrd/storage-sdk';
import { env } from 'process';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async listFiles(userId: string) {
    return this.prisma.file.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getFile(userId: string, id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file || file.userId !== userId) throw new Error('Not found');
    return file;
  }

  async getDownloadProxy(userId: string, id: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file || file.userId !== userId) throw new Error('Not found');
    if (!file.b2ObjectId) throw new Error('File not available');

    const b2 = new BackblazeB2Client({ accountId: env.B2_ACCOUNT_ID ?? '', applicationKey: env.B2_APPLICATION_KEY ?? '', bucketId: env.B2_BUCKET_ID ?? '' });

    const buffer = await b2.downloadFileById(file.b2ObjectId);
    return { buffer, contentType: file.contentType, fileName: file.fileName };
  }
}
