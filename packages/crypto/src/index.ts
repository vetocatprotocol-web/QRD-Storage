import { randomBytes, createCipheriv, createDecipheriv, createHmac } from 'crypto';
import argon2 from 'argon2';

export interface EncryptedChunk {
  iv: string;
  ciphertext: string;
  authTag: string;
}

function isBrowser(): boolean {
  return typeof globalThis !== 'undefined' && typeof (globalThis as any).crypto?.subtle !== 'undefined';
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') return Uint8Array.from(Buffer.from(b64, 'base64'));
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function deriveMasterKey(
  password: string,
  salt: Uint8Array,
  iterations = 3,
  memoryCost = 65536,
  parallelism = 1,
  hashLength = 32,
): Promise<Uint8Array> {
  // Prefer Argon2 (Node) if available; otherwise fallback to PBKDF2 via WebCrypto
  if (!isBrowser()) {
    const bufSalt = Buffer.from(salt);
    const hashed = (await argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: iterations,
      memoryCost,
      parallelism,
      hashLength,
      salt: bufSalt,
      raw: true,
    })) as Buffer;
    return Uint8Array.from(hashed);
  }

  // Browser fallback: PBKDF2-SHA256
  const enc = new TextEncoder();
  const passKey = await (globalThis as any).crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derived = await (globalThis as any).crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt, iterations: Math.max(100000, iterations * 100000), hash: 'SHA-256' },
    passKey,
    hashLength * 8,
  );
  return new Uint8Array(derived);
}

export function deriveKeyFromKey(key: Uint8Array, info: string, length = 32): Uint8Array {
  // Simple HMAC-based extractor + expand (not full HKDF but sufficient for our use)
  if (!isBrowser()) {
    const prk = createHmac('sha256', Buffer.from(key)).update(info).digest();
    const okm = createHmac('sha256', prk).update(Buffer.from('qrds:' + info)).digest();
    return Uint8Array.from(okm.slice(0, length));
  }

  // Browser HMAC using subtle
  const cryptoSubtle = (globalThis as any).crypto.subtle;
  const enc = new TextEncoder();
  const keyPromise = cryptoSubtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  // synchronous fallback not possible here; keep simple synchronous API by blocking (not ideal)
  throw new Error('deriveKeyFromKey: browser HMAC deriveKeyFromKey not implemented synchronously. Use Node or adapt async flow.');
}

export function generateRandomKey(length = 32): Uint8Array {
  if (!isBrowser()) return Uint8Array.from(randomBytes(length));
  const arr = new Uint8Array(length);
  (globalThis as any).crypto.getRandomValues(arr);
  return arr;
}

export function encryptChunk(chunk: Uint8Array, key: Uint8Array): EncryptedChunk {
  if (!isBrowser()) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(key), iv);
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(chunk)), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
      iv: iv.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  // Browser synchronous API not available for subtle crypto; throw to force async path in caller
  throw new Error('encryptChunk: browser encrypt requires async API; use encryptChunkAsync instead');
}

export function decryptChunk(encrypted: EncryptedChunk, key: Uint8Array): Uint8Array {
  if (!isBrowser()) {
    const iv = Buffer.from(encrypted.iv, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(key), iv);
    decipher.setAuthTag(authTag);
    return Uint8Array.from(Buffer.concat([decipher.update(ciphertext), decipher.final()]));
  }

  throw new Error('decryptChunk: browser decrypt requires async API; use decryptChunkAsync instead');
}

// Async browser helpers
export async function encryptChunkAsync(chunk: Uint8Array, key: Uint8Array): Promise<EncryptedChunk> {
  if (!isBrowser()) return encryptChunk(chunk, key);
  const iv = (globalThis as any).crypto.getRandomValues(new Uint8Array(12));
  const cryptoSubtle = (globalThis as any).crypto.subtle;
  const cryptoKey = await cryptoSubtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
  const ct = await cryptoSubtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, chunk);
  // AES-GCM in WebCrypto appends auth tag to ciphertext.
  const ctBytes = new Uint8Array(ct);
  // In Node we returned authTag separately; split last 16 bytes as tag
  const tagLen = 16;
  const authTag = ctBytes.slice(ctBytes.length - tagLen);
  const ciphertext = ctBytes.slice(0, ctBytes.length - tagLen);
  return {
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
    authTag: toBase64(authTag),
  };
}

export async function decryptChunkAsync(encrypted: EncryptedChunk, key: Uint8Array): Promise<Uint8Array> {
  if (!isBrowser()) return decryptChunk(encrypted, key);
  const iv = fromBase64(encrypted.iv);
  const ciphertext = fromBase64(encrypted.ciphertext);
  const authTag = fromBase64(encrypted.authTag);
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext, 0);
  combined.set(authTag, ciphertext.length);
  const cryptoSubtle = (globalThis as any).crypto.subtle;
  const cryptoKey = await cryptoSubtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
  const plain = await cryptoSubtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, combined);
  return new Uint8Array(plain);
}
