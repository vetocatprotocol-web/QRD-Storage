import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { DevicesController } from './devices.controller.js';
import { DevicesService } from './devices.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
