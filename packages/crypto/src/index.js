import { randomBytes, createCipheriv, createDecipheriv, createHmac } from 'crypto';
import argon2 from 'argon2';
export async function deriveMasterKey(password, salt, iterations = 3, memoryCost = 65536, parallelism = 1, hashLength = 32) {
    return argon2.hash(password, {
        type: argon2.argon2id,
        timeCost: iterations,
        memoryCost,
        parallelism,
        hashLength,
        salt,
        raw: true,
    });
}
export function deriveKeyFromKey(key, info, length = 32) {
    const prk = createHmac('sha256', key).update(info).digest();
    const okm = createHmac('sha256', prk).update(Buffer.from('qrds:' + info)).digest();
    return okm.slice(0, length);
}
export function generateRandomKey(length = 32) {
    return randomBytes(length);
}
export function encryptChunk(chunk, key) {
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
export function decryptChunk(encrypted, key) {
    const iv = Buffer.from(encrypted.iv, 'base64');
    const authTag = Buffer.from(encrypted.authTag, 'base64');
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
