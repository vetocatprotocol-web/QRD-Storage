import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RegisterDeviceDto } from './dto/register-device.dto.js';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(userId: string, payload: RegisterDeviceDto) {
    const deviceKey = randomBytes(32).toString('base64url');
    const device = await this.prisma.device.create({
      data: {
        userId,
        name: payload.name,
        deviceKey,
      },
    });

    return {
      deviceId: device.id,
      deviceKey,
      name: device.name,
      createdAt: device.createdAt,
    };
  }
}
