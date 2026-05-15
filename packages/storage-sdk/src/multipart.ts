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
