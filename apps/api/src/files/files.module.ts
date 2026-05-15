import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class FilesModule {}
