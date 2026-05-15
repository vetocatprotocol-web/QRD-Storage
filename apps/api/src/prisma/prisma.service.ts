import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import path from 'path';
import { createRequire } from 'module';

const requireFromMeta = createRequire(import.meta.url);
function loadPrismaClient() {
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  try {
    const mod = requireFromMeta(prismaClientPath);
    return mod.PrismaClient || mod.default?.PrismaClient || mod;
  } catch (err) {
    // rethrow with clearer message
    throw new Error(`Failed to load generated Prisma client from ${prismaClientPath}: ${err}`);
  }
}

const PrismaClientCtor = loadPrismaClient();

@Injectable()
export class PrismaService extends PrismaClientCtor implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
