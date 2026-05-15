import { BackblazeB2Client } from './backblaze';

export interface MultipartUploadOptions {
  chunkSize?: number; // bytes
}

export async function uploadFileMultipart(client: BackblazeB2Client, fileName: string, data: Uint8Array, opts: MultipartUploadOptions = {}) {
  const chunkSize = opts.chunkSize || 8 * 1024 * 1024; // 8MB
  if (data.byteLength <= chunkSize) {
    // small file path: use single uploadUrl flow
    const uploadInfo = await client.generateUploadUrl(fileName, 'application/octet-stream');
    const resp = await fetch(uploadInfo.uploadUrl, { method: 'POST', headers: { Authorization: uploadInfo.authorizationToken, 'Content-Type': 'application/octet-stream' }, body: data as any });
    if (!resp.ok) throw new Error('upload failed');
    return resp.json();
  }

  // start large file
  const startRes = await client.startLargeFile(fileName);
  const fileId = startRes.fileId;
  const partSha1s: string[] = [];

  const totalParts = Math.ceil(data.byteLength / chunkSize);
  for (let i = 0; i < totalParts; i++) {
    const start = i * chunkSize;
    const end = Math.min(data.byteLength, start + chunkSize);
    const part = data.slice(start, end);

    const partUrl = await client.getUploadPartUrl(fileId);
    const uploadRes = await client.uploadPart(partUrl.uploadUrl, partUrl.authorizationToken, i + 1, part as any);
    partSha1s.push((uploadRes as any).contentSha1);
  }

  const finish = await client.finishLargeFile(fileId, partSha1s);
  return finish;
}

export interface ResumableCheckpoint {
  fileId: string;
  uploadedParts: { [partNumber: number]: string };
}

export interface ResumableOptions extends MultipartUploadOptions {
  concurrency?: number;
  maxRetries?: number;
  onProgress?: (uploadedParts: number, totalParts: number) => void;
  saveCheckpoint?: (checkpoint: ResumableCheckpoint) => Promise<void> | void;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function uploadFileMultipartResumable(
  client: BackblazeB2Client,
  fileName: string,
  data: Uint8Array,
  opts: ResumableOptions = {},
  resumeFrom?: ResumableCheckpoint,
) {
  const chunkSize = opts.chunkSize || 8 * 1024 * 1024;
  const concurrency = opts.concurrency || 3;
  const maxRetries = opts.maxRetries ?? 3;

  if (data.byteLength <= chunkSize) {
    return uploadFileMultipart(client, fileName, data, opts);
  }

  const totalParts = Math.ceil(data.byteLength / chunkSize);
  let checkpoint: ResumableCheckpoint;
  if (resumeFrom) {
    checkpoint = { fileId: resumeFrom.fileId, uploadedParts: { ...resumeFrom.uploadedParts } };
  } else {
    const startRes = await client.startLargeFile(fileName);
    checkpoint = { fileId: startRes.fileId, uploadedParts: {} };
    if (opts.saveCheckpoint) await opts.saveCheckpoint(checkpoint);
  }

  const pendingParts: number[] = [];
  for (let i = 1; i <= totalParts; i++) {
    if (!checkpoint.uploadedParts[i]) pendingParts.push(i);
  }

  let active = 0;
  let idx = 0;
  let failed = null as Error | null;

  return await new Promise<any>(async (resolve, reject) => {
    const uploadOne = async (partNumber: number) => {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(data.byteLength, start + chunkSize);
      const part = data.slice(start, end);

      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          const partUrl = await client.getUploadPartUrl(checkpoint.fileId);
          const uploadRes = await client.uploadPart(partUrl.uploadUrl, partUrl.authorizationToken, partNumber, part as any);
          const sha1 = (uploadRes as any).contentSha1;
          checkpoint.uploadedParts[partNumber] = sha1;
          if (opts.saveCheckpoint) await opts.saveCheckpoint(checkpoint);
          if (opts.onProgress) opts.onProgress(Object.keys(checkpoint.uploadedParts).length, totalParts);
          return;
        } catch (err) {
          attempt++;
          if (attempt > maxRetries) {
            throw err;
          }
          const backoff = 500 * Math.pow(2, attempt);
          await sleep(backoff);
        }
      }
    };

    const runNext = async () => {
      if (failed) return;
      if (idx >= pendingParts.length && active === 0) {
        // all done
        try {
          // build ordered sha list
          const partSha1s: string[] = [];
          for (let i = 1; i <= totalParts; i++) {
            const s = checkpoint.uploadedParts[i];
            if (!s) throw new Error(`Missing part ${i} in checkpoint`);
            partSha1s.push(s);
          }
          const finish = await client.finishLargeFile(checkpoint.fileId, partSha1s);
          resolve(finish);
        } catch (err) {
          reject(err);
        }
        return;
      }

      while (active < concurrency && idx < pendingParts.length) {
        const partNumber = pendingParts[idx++];
        active++;
        uploadOne(partNumber)
          .then(() => {
            active--;
            runNext();
          })
          .catch((err) => {
            failed = err;
            reject(err);
          });
      }
    };

    runNext();
  });
}
