import { randomBytes, createCipheriv, createDecipheriv, createHmac } from 'crypto';
import argon2 from 'argon2';

export interface EncryptedChunk {
  iv: string;
  ciphertext: string;
  authTag: string;
}

export async function deriveMasterKey(
  password: string,
  salt: Buffer,
  iterations = 3,
  memoryCost = 65536,
  parallelism = 1,
  hashLength = 32,
): Promise<Buffer> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: iterations,
    memoryCost,
    parallelism,
    hashLength,
    salt,
    raw: true,
  }) as Promise<Buffer>;
}

export function deriveKeyFromKey(key: Buffer, info: string, length = 32): Buffer {
  const prk = createHmac('sha256', key).update(info).digest();
  const okm = createHmac('sha256', prk).update(Buffer.from('qrds:' + info)).digest();
  return okm.slice(0, length);
}

export function generateRandomKey(length = 32): Buffer {
  return randomBytes(length);
}

export function encryptChunk(chunk: Buffer, key: Buffer): EncryptedChunk {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(chunk), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptChunk(encrypted: EncryptedChunk, key: Buffer): Buffer {
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
