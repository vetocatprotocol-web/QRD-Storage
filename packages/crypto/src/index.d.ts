export interface EncryptedChunk {
    iv: string;
    ciphertext: string;
    authTag: string;
}
export declare function deriveMasterKey(password: string, salt: Buffer, iterations?: number, memoryCost?: number, parallelism?: number, hashLength?: number): Promise<Buffer>;
export declare function deriveKeyFromKey(key: Buffer, info: string, length?: number): Buffer;
export declare function generateRandomKey(length?: number): Buffer;
export declare function encryptChunk(chunk: Buffer, key: Buffer): EncryptedChunk;
export declare function decryptChunk(encrypted: EncryptedChunk, key: Buffer): Buffer;
