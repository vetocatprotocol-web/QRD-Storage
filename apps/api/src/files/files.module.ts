import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller.js';
import { UploadService } from './upload.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { FilesController } from './files.controller.js';
import { FilesService } from './files.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UploadController, FilesController],
  providers: [UploadService, FilesService],
  exports: [UploadService, FilesService],
})
export class FilesModule {}
