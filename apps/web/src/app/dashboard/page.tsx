'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@qrd/ui';
import { Card } from '@qrd/ui';
import { LogoIcon } from '@qrd/ui';
import { registerDevice, createUploadSession, startMultipart, getPartUrl, finishMultipart, verifyUpload } from '../../lib/api';
import { saveDeviceKey, getDeviceKey } from '../../lib/session';
import { enqueue, getPending, updateJob, deleteJob, SyncJob, saveCheckpoint, getCheckpoint, deleteCheckpoint } from '@qrd/sync-core';
import { getAccessToken, saveTokens, clearTokens } from '../../lib/session';
import OnboardingWalkthrough from '../../components/OnboardingWalkthrough';
// Use WebCrypto directly in the browser UI to avoid bundling Node-only crypto helpers

function generateRandomKey(length = 32) {
  const arr = new Uint8Array(length);
  globalThis.crypto.getRandomValues(arr);
  return arr;
}

async function encryptWithWebCrypto(chunk: Uint8Array, key: Uint8Array) {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const subtle = globalThis.crypto.subtle;
  const keyBuf = (new Uint8Array(key)).buffer;
  const cryptoKey = await subtle.importKey('raw', keyBuf as ArrayBuffer, 'AES-GCM', false, ['encrypt']);
  const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, (new Uint8Array(chunk)).buffer);
  const ctBytes = new Uint8Array(ct);
  const tagLen = 16;
  const authTag = ctBytes.slice(ctBytes.length - tagLen);
  const ciphertext = ctBytes.slice(0, ctBytes.length - tagLen);
  const toB64 = (b: Uint8Array) => (typeof Buffer !== 'undefined' ? Buffer.from(b).toString('base64') : btoa(String.fromCharCode(...b)));
  return { iv: toB64(iv), ciphertext: toB64(ciphertext), authTag: toB64(authTag) };
}

const initialMetrics = [
  { label: 'Encrypted Files', value: '0', description: 'Your secure objects in the vault' },
  { label: 'Connected Devices', value: '0', description: 'Devices linked to your account' },
  { label: 'Storage Optimized', value: '0 GB', description: 'Local storage freed with cloud backups' },
];


export default function DashboardPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('My laptop');
  const [uploadFileName, setUploadFileName] = useState('video.mp4');
  const [uploadFileType, setUploadFileType] = useState('video/mp4');
  const [uploadFileSize, setUploadFileSize] = useState(104857600);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setAccessToken(getAccessToken());
  }, []);

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  useEffect(() => {
    if (!accessToken) return;
    try {
      const onboarded = localStorage.getItem('qrd.onboarded');
      if (!onboarded) setShowWalkthrough(true);
    } catch (e) {
      // ignore
    }
  }, [accessToken]);

  const statusMessage = useMemo(() => {
    if (!accessToken) {
      return 'Please sign in to register devices and request upload sessions.';
    }
    return 'You can register a device and generate a direct signed upload session.';
  }, [accessToken]);

  const handleLogout = () => {
    clearTokens();
    setAccessToken(null);
  };

  const handleRegisterDevice = async () => {
    if (!accessToken) return;
    setStatus('Registering device...');
    try {
      const device = await registerDevice(accessToken, { name: deviceName });
      // persist device key locally so we can wrap file keys for this device
      if (device.deviceKey) saveDeviceKey(device.deviceKey);
      setStatus(`Device registered: ${device.name}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Device registration failed.');
    }
  };

  const handleCreateUploadSession = async () => {
    if (!accessToken) return;
    setStatus('Creating upload session...');
    try {
      const session = await createUploadSession(accessToken, {
        fileName: uploadFileName,
        contentType: uploadFileType,
        fileSize: uploadFileSize,
      });
      setStatus(`Upload session ready: ${session.uploadUrl}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload session creation failed.');
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setSelectedFile(f || null);
    if (f) {
      setUploadFileName(f.name);
      setUploadFileType(f.type || 'application/octet-stream');
      setUploadFileSize(f.size);
    }
  };

  const handleUploadFile = async () => {
    if (!accessToken || !selectedFile) return;
    setStatus('Requesting upload session...');
    try {
      const session = await createUploadSession(accessToken, {
        fileName: selectedFile.name,
        contentType: selectedFile.type || 'application/octet-stream',
        fileSize: selectedFile.size,
      });

      // small-file direct upload with optional compress+encrypt
      if (selectedFile.size <= 8 * 1024 * 1024) {
        setStatus('Uploading...');
        const ab = await selectedFile.arrayBuffer();
        let bytes = new Uint8Array(ab);
        const alreadyCompressed = /image\/|video\/|zip|gzip|mp4|mpeg/.test(selectedFile.type || '');
        if (!alreadyCompressed && (globalThis as any).CompressionStream) {
          try {
            const cs = new (globalThis as any).CompressionStream('gzip');
            const writer = cs.writable.getWriter();
            writer.write(bytes);
            writer.close();
            const reader = cs.readable.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(new Uint8Array(value));
            }
            let total = 0;
            for (const c of chunks) total += c.length;
            const out = new Uint8Array(total);
            let offset = 0;
            for (const c of chunks) {
              out.set(c, offset);
              offset += c.length;
            }
            bytes = out;
          } catch (e) {
            // ignore
          }
        }

        const fileKey = generateRandomKey(32);
        const enc = await encryptWithWebCrypto(bytes, fileKey);
        // wrap file key with device key if available
        const deviceKeyBase64 = getDeviceKey();
        let wrappedKeyB64: string | null = null;
        let wrappedIv: string | null = null;
        if (deviceKeyBase64) {
          try {
            const dk = (typeof Buffer !== 'undefined') ? Uint8Array.from(Buffer.from(deviceKeyBase64, 'base64url')) : (() => { const s = atob(deviceKeyBase64.replace(/-/g, '+').replace(/_/g, '/')); const arr = new Uint8Array(s.length); for (let i=0;i<s.length;i++) arr[i]=s.charCodeAt(i); return arr; })();
            const wrapIv = globalThis.crypto.getRandomValues(new Uint8Array(12));
            const subtle = globalThis.crypto.subtle;
            const keyBuf = (new Uint8Array(dk)).buffer;
            const cryptoKey = await subtle.importKey('raw', keyBuf as ArrayBuffer, 'AES-GCM', false, ['encrypt']);
            const ct = await subtle.encrypt({ name: 'AES-GCM', iv: wrapIv }, cryptoKey, (new Uint8Array(fileKey)).buffer);
            const b64 = (typeof Buffer !== 'undefined') ? Buffer.from(new Uint8Array(ct)).toString('base64') : btoa(String.fromCharCode(...new Uint8Array(ct)));
            wrappedKeyB64 = b64;
            wrappedIv = (typeof Buffer !== 'undefined') ? Buffer.from(wrapIv).toString('base64') : btoa(String.fromCharCode(...wrapIv));
          } catch (e) {
            // ignore wrapping errors
          }
        }
        const b64ToUint8 = (s: string) => (typeof Buffer !== 'undefined' ? Uint8Array.from(Buffer.from(s, 'base64')) : (() => { const bin = atob(s); const arr = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; })());
        const ct = b64ToUint8(enc.ciphertext);
        const tag = b64ToUint8(enc.authTag);
        const combined = new Uint8Array(ct.length + tag.length);
        combined.set(ct, 0);
        combined.set(tag, ct.length);

        const resp = await fetch(session.uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: session.authorizationToken,
            'Content-Type': 'application/octet-stream',
            'X-Bz-Info-qrd-iv': enc.iv,
          },
          body: combined,
        });
        if (!resp.ok) throw new Error('Upload failed');
        const json = await resp.json();
        setStatus(`Upload complete. b2FileId=${json.fileId || 'unknown'}`);
        // attempt server-side verify for small-file path
        try {
          await verifyUpload(getAccessToken() || '', {
            uploadSessionId: session.uploadSessionId,
            b2FileId: json.fileId,
            encryptedSha1: json.contentSha1 || json.contentSha1 || undefined,
            encryptionIv: enc.iv,
            encryptedFileKey: wrappedKeyB64,
            chunkCount: 1,
          });
          setStatus('Upload verified.');
        } catch (e) {
          // ignore verify errors for now
        }
      } else {
        setStatus('Starting multipart upload...');
        try {
          const start = await startMultipart(getAccessToken() || '', { fileName: selectedFile.name, contentType: selectedFile.type || 'application/octet-stream' });
          const fileId = start.fileId;
          const dbFileId = start.dbFileId;

          const chunkSize = 8 * 1024 * 1024;
          const totalParts = Math.ceil(selectedFile.size / chunkSize);
          // load existing checkpoint if any
          const existing = await getCheckpoint(fileId);
          let checkpoint = existing && existing.checkpoint ? existing.checkpoint : { fileId, uploadedParts: {} as Record<number, string> };
          const partSha1s: string[] = [];

          // generate fileKey once for all parts
          const fileKey = generateRandomKey(32);
          // if device key available, wrap fileKey with it for server-side storage
          const deviceKeyBase64 = getDeviceKey();
          let wrappedKeyB64: string | null = null;
          let wrappedIv: string | null = null;
          if (deviceKeyBase64) {
            try {
              const dk = (typeof Buffer !== 'undefined') ? Uint8Array.from(Buffer.from(deviceKeyBase64, 'base64url')) : (() => { const s = atob(deviceKeyBase64.replace(/-/g, '+').replace(/_/g, '/')); const arr = new Uint8Array(s.length); for (let i=0;i<s.length;i++) arr[i]=s.charCodeAt(i); return arr; })();
              const wrapIv = globalThis.crypto.getRandomValues(new Uint8Array(12));
              const subtle = globalThis.crypto.subtle;
              const keyBuf = (new Uint8Array(dk)).buffer;
              const cryptoKey = await subtle.importKey('raw', keyBuf as ArrayBuffer, 'AES-GCM', false, ['encrypt']);
              const ct = await subtle.encrypt({ name: 'AES-GCM', iv: wrapIv }, cryptoKey, (new Uint8Array(fileKey)).buffer);
              const b64 = (typeof Buffer !== 'undefined') ? Buffer.from(new Uint8Array(ct)).toString('base64') : btoa(String.fromCharCode(...new Uint8Array(ct)));
              wrappedKeyB64 = b64;
              wrappedIv = (typeof Buffer !== 'undefined') ? Buffer.from(wrapIv).toString('base64') : btoa(String.fromCharCode(...wrapIv));
            } catch (e) {
              // ignore wrapping errors
            }
          }

          for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
            // skip already uploaded parts
            if (checkpoint.uploadedParts && checkpoint.uploadedParts[partNumber]) {
              partSha1s[partNumber - 1] = checkpoint.uploadedParts[partNumber];
              setStatus(`Resuming, skipping uploaded part ${partNumber}/${totalParts}`);
              continue;
            }

            const startByte = (partNumber - 1) * chunkSize;
            const endByte = Math.min(selectedFile.size, startByte + chunkSize);
            const slice = selectedFile.slice(startByte, endByte);
            const ab = await slice.arrayBuffer();
            let bytes = new Uint8Array(ab);

            // encrypt part
            const enc = await encryptWithWebCrypto(bytes, fileKey);
            const b64ToUint8 = (s: string) => (typeof Buffer !== 'undefined' ? Uint8Array.from(Buffer.from(s, 'base64')) : (() => { const bin = atob(s); const arr = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; })());
            const ct = b64ToUint8(enc.ciphertext);
            const tag = b64ToUint8(enc.authTag);
            const combined = new Uint8Array(ct.length + tag.length);
            combined.set(ct, 0);
            combined.set(tag, ct.length);

            // ask server for upload part URL
            const partUrl = await getPartUrl(getAccessToken() || '', fileId);
            // upload to Backblaze uploadUrl directly
            const resp = await fetch(partUrl.uploadUrl, {
              method: 'POST',
              headers: {
                Authorization: partUrl.authorizationToken,
                'Content-Type': 'application/octet-stream',
                'X-Bz-Part-Number': String(partNumber),
                'X-Bz-Info-qrd-iv': enc.iv,
              },
              body: combined,
            });
            if (!resp.ok) throw new Error(`Part upload failed on part ${partNumber}`);
            const json = await resp.json();
            const sha1 = json.contentSha1;
            partSha1s[partNumber - 1] = sha1;

            // update checkpoint after successful part upload
            checkpoint.uploadedParts[partNumber] = sha1;
            await saveCheckpoint(fileId, checkpoint);

            // update progress UI
            if (start.uploadSessionId && typeof start.uploadSessionId === 'number') {
              setProgressForJob(start.uploadSessionId, Object.keys(checkpoint.uploadedParts).length, totalParts, `part ${partNumber}/${totalParts}`);
            }

            setStatus(`Uploaded part ${partNumber}/${totalParts}`);
          }

          const finishRes = await finishMultipart(getAccessToken() || '', { fileId, partSha1Array: partSha1s });
          setStatus('Multipart upload finished. Verifying...');
          // call verify endpoint with resulting file id if available
          const b2FileId = (finishRes && (finishRes.fileId || finishRes.fileId)) || undefined;
          if (b2FileId) {
            try {
              await verifyUpload(getAccessToken() || '', { uploadSessionId: start.uploadSessionId, b2FileId, encryptedSha1: /* use overall checksum? use first part */ partSha1s[0], chunkCount: partSha1s.length, encryptedFileKey: wrappedKeyB64, encryptionIv: wrappedIv });
            } catch (e) {
              // ignore verify errors for now
            }
            // cleanup checkpoint store
            await deleteCheckpoint(fileId);
          }
          setStatus('Upload complete.');
        } catch (e) {
          setStatus(e instanceof Error ? e.message : String(e));
        }
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  // Enqueue selected file into sync-core and start local processor
  const handleEnqueueAndProcess = async () => {
    if (!selectedFile) return;
    setStatus('Enqueueing file...');
    const job: SyncJob = { filePath: selectedFile.name, fileSize: selectedFile.size, state: 'discovered' };
    const id = await enqueue(job as SyncJob);
    setStatus(`File enqueued (id=${id}). Processing...`);
    // Immediately run processor for pending jobs
    await runProcessor();
  };

  async function runProcessor() {
    const pending = await getPending();
    for (const j of pending) {
      try {
        // mark uploading
        j.state = 'uploading';
        await updateJob(j);

        // find file in input (only handle selectedFile for now)
        if (!selectedFile || selectedFile.name !== j.filePath) {
          j.state = 'failed';
          j.lastError = 'File not available in browser UI';
          await updateJob(j);
          continue;
        }

        // request upload session from API
        const session = await createUploadSession(getAccessToken() || '', {
          fileName: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
        });

        // read file bytes
        const ab = await selectedFile.arrayBuffer();
        let bytes = new Uint8Array(ab);

        // optional compression (gzip) if supported and file not already compressed
        const alreadyCompressed = /image\/|video\/|zip|gzip|mp4|mpeg/.test(selectedFile.type || '');
        if (!alreadyCompressed && (globalThis as any).CompressionStream) {
          try {
            const cs = new (globalThis as any).CompressionStream('gzip');
            const writer = cs.writable.getWriter();
            writer.write(bytes);
            writer.close();
            const reader = cs.readable.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(new Uint8Array(value));
            }
            let total = 0;
            for (const c of chunks) total += c.length;
            const out = new Uint8Array(total);
            let offset = 0;
            for (const c of chunks) {
              out.set(c, offset);
              offset += c.length;
            }
            bytes = out;
          } catch (e) {
            // ignore compression errors
          }
        }

        // encrypt using random file key (key kept only on device)
        const fileKey = generateRandomKey(32);
        const enc = await encryptWithWebCrypto(bytes, fileKey);
        const b64ToUint8 = (s: string) => (typeof Buffer !== 'undefined' ? Uint8Array.from(Buffer.from(s, 'base64')) : (() => { const bin = atob(s); const arr = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; })());
        const ct = b64ToUint8(enc.ciphertext);
        const tag = b64ToUint8(enc.authTag);
        const combined = new Uint8Array(ct.length + tag.length);
        combined.set(ct, 0);
        combined.set(tag, ct.length);

        // update progress in UI
        setProgressForJob(j.id, bytes.length, bytes.length, 'encrypt+upload');

        const resp = await fetch(session.uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: session.authorizationToken,
            'Content-Type': 'application/octet-stream',
            'X-Bz-Info-qrd-iv': enc.iv,
          },
          body: combined,
        });
        if (!resp.ok) throw new Error('Upload failed');

        // mark verified/synced (in real app we'd call verify endpoint)
        j.state = 'synced';
        await updateJob(j);
        setStatus(`File ${j.filePath} uploaded and synced.`);
        if (j.id) setProgressForJob(j.id, 1, 1, 'done');
        // optionally remove from queue
        if (j.id) await deleteJob(j.id);
      } catch (err) {
        j.state = 'failed';
        j.lastError = err instanceof Error ? err.message : String(err);
        await updateJob(j);
        setStatus(j.lastError || 'Processing failed');
      }
    }
  }

  // Poll queue for UI
  useEffect(() => {
    let mounted = true;
    async function poll() {
      const list = await getPending();
      if (mounted) setQueue(list);
    }
    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const [queue, setQueue] = useState<SyncJob[]>([]);
  const [jobProgress, setJobProgress] = useState<Record<number, { uploaded: number; total: number; text?: string }>>({});

  function setProgressForJob(id: number | undefined, uploaded: number, total: number, text?: string) {
    if (!id) return;
    setJobProgress((s) => ({ ...s, [id]: { uploaded, total, text } }));
  }

  return (
    <main className="page-shell">
      <div style={{ marginBottom: 12 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="eyebrow">Storage suggestion</p>
              <p className="page-copy">We detected you have backups older than 30 days. Free up space by removing local copies.</p>
            </div>
            <div>
              <Button label="Review recommendations" onClick={() => alert('Recommendation: Remove 3.2 GB of local files.')} />
            </div>
          </div>
        </Card>
      </div>
      <section className="dashboard-hero">
        <div className="dashboard-panel">
          <LogoIcon className="logo-icon" />
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Encrypted sync status</h1>
            <p className="page-copy">{statusMessage}</p>
          </div>
          {accessToken ? (
            <Button label="Sign out" onClick={handleLogout} />
          ) : null}
        </div>

        <div className="metrics-grid">
          {initialMetrics.map((metric) => (
            <Card key={metric.label} style={{ padding: 24 }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{metric.label}</p>
              <p style={{ margin: '0.75rem 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{metric.value}</p>
              <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>{metric.description}</p>
            </Card>
          ))}
        </div>

        <Card style={{ padding: 32 }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <p className="eyebrow">Device registration</p>
              <p className="page-copy">Register a new device to establish a trusted sync endpoint.</p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input
                value={deviceName}
                onChange={(event) => setDeviceName(event.target.value)}
                placeholder="Device name"
                style={{ width: '100%', borderRadius: 16, border: '1px solid #cbd5e1', padding: '0.9rem 1rem', fontSize: 15 }}
              />
              <Button label="Register device" onClick={handleRegisterDevice} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: 32 }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <div>
              <p className="eyebrow">Upload session</p>
              <p className="page-copy">Request a direct signed upload session for encrypted file upload.</p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <input
                value={uploadFileName}
                onChange={(event) => setUploadFileName(event.target.value)}
                placeholder="File name"
                style={{ width: '100%', borderRadius: 16, border: '1px solid #cbd5e1', padding: '0.9rem 1rem', fontSize: 15 }}
              />
              <input
                value={uploadFileType}
                onChange={(event) => setUploadFileType(event.target.value)}
                placeholder="Content type"
                style={{ width: '100%', borderRadius: 16, border: '1px solid #cbd5e1', padding: '0.9rem 1rem', fontSize: 15 }}
              />
              <input
                type="number"
                value={uploadFileSize}
                onChange={(event) => setUploadFileSize(Number(event.target.value))}
                placeholder="File size in bytes"
                style={{ width: '100%', borderRadius: 16, border: '1px solid #cbd5e1', padding: '0.9rem 1rem', fontSize: 15 }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <Button label="Create upload session" onClick={handleCreateUploadSession} />
                <input type="file" onChange={handleSelectFile} />
                <Button label="Upload selected file" onClick={handleUploadFile} />
              </div>
            </div>
          </div>
        </Card>

        {status ? (
          <Card style={{ padding: 24 }}>
            <p style={{ margin: 0, color: '#0f172a' }}>{status}</p>
          </Card>
        ) : null}
        {showWalkthrough ? <OnboardingWalkthrough onClose={() => setShowWalkthrough(false)} /> : null}
        <Card style={{ padding: 24 }}>
          <p className="eyebrow">Upload Queue</p>
          {queue.length === 0 ? <div className="page-copy">No pending uploads</div> : null}
          <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
            {queue.map((j) => {
              const prog = j.id ? jobProgress[j.id] : undefined;
              const pct = prog && prog.total > 0 ? Math.round((prog.uploaded / prog.total) * 100) : j.state === 'synced' ? 100 : 0;
              return (
                <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{j.filePath}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{j.state} {prog?.text ? `— ${prog.text}` : ''}</div>
                    <div style={{ height: 8, background: '#e6eef8', borderRadius: 6, marginTop: 8 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: 6 }} />
                    </div>
                  </div>
                  <div style={{ marginLeft: 12, display: 'flex', gap: 8 }}>
                    <Button label="Retry" onClick={async () => { if (j.id) { j.state = 'discovered'; await updateJob(j); } }} />
                    <Button label="Cancel" onClick={async () => { if (j.id) { await deleteJob(j.id); const list = await getPending(); setQueue(list); } }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </main>
  );
}
