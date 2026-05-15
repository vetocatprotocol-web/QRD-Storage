import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { BackblazeB2Client } from '@qrd/storage-sdk';

const prisma = new PrismaClient();
const B2 = new BackblazeB2Client({ accountId: process.env.B2_ACCOUNT_ID ?? '', applicationKey: process.env.B2_APPLICATION_KEY ?? '', bucketId: process.env.B2_BUCKET_ID ?? '' });

async function verifyPending() {
  const pending = await prisma.file.findMany({ where: { status: 'pending' }, include: { uploadSession: true } });
  for (const f of pending) {
    try {
      if (!f.b2ObjectId) continue;
      const info = await B2.getFileInfoById(f.b2ObjectId);
      if (!info) continue;
      // Basic verification: size matches
      if (BigInt(f.fileSize) === BigInt(info.size)) {
        await prisma.file.update({ where: { id: f.id }, data: { verificationState: 'VERIFIED', status: 'available' } });
        console.log('Verified file', f.id);
      } else {
        await prisma.file.update({ where: { id: f.id }, data: { verificationState: 'FAILED', status: 'error' } });
        console.warn('Size mismatch for file', f.id);
      }
    } catch (err) {
      console.error('Error verifying file', f.id, err);
    }
  }
}

async function main() {
  console.log('Upload verify worker started');
  while (true) {
    try {
      await verifyPending();
    } catch (err) {
      console.error('Worker error', err);
    }
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
