'use client';

import { useEffect, useRef, useState } from 'react';
import { getAccessToken } from '../../lib/session';
import { getFiles } from '../../lib/api';
import { Card } from '@qrd/ui';
import { Button } from '@qrd/ui';
import Link from 'next/link';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const closePreviewRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    setStatus('Loading files...');
    getFiles(token)
      .then((list) => {
        setFiles(list);
        setStatus(null);
      })
      .catch((err) => setStatus(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <main className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Files</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard">
            <Button label="Upload files" />
          </Link>
        </div>
      </div>

      {status ? <p aria-live="polite">{status}</p> : null}

      {files.length === 0 ? (
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <p className="eyebrow">No files yet</p>
          <p className="page-copy">Start by uploading a file from your device. Files are encrypted in your browser before upload.</p>
          <div style={{ marginTop: 12 }}>
            <Link href="/dashboard">
              <Button label="Go to Upload" />
            </Link>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {files.map((f) => (
            <Card key={f.id} style={{ padding: 12 }} aria-label={`File ${f.fileName}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {f.contentType && f.contentType.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}/files/${f.id}/download`} alt={f.fileName} style={{ maxWidth: '100%', maxHeight: 64, borderRadius: 6 }} />
                    ) : (
                      <div style={{ fontSize: 28, color: '#94a3b8' }}>📄</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{f.fileName}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{f.contentType} · {formatBytes(Number(f.fileSize || 0))}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button label="Preview" onClick={() => {
                    if (f.contentType && f.contentType.startsWith('image/')) {
                      setPreview({ type: 'image', url: `${process.env.NEXT_PUBLIC_API_URL}/files/${f.id}/download` });
                    } else {
                      setPreview({ type: 'note', text: 'Preview not available for this file type' });
                    }
                  }} />
                  <a href={`${process.env.NEXT_PUBLIC_API_URL}/files/${f.id}/download`} style={{ marginLeft: 8 }}>
                    <Button label="Download" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

          {preview ? (
            <div
              className="preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-title"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setPreview(null);
              }}
              style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.5)', zIndex: 60 }}
            >
              <div className="preview-panel" style={{ background: '#fff', padding: 20, borderRadius: 12, maxWidth: '95%', maxHeight: '90%', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 id="preview-title" style={{ margin: 0 }}>{preview.type === 'image' ? 'Image preview' : 'Preview'}</h3>
                  <button ref={closePreviewRef} aria-label="Close preview" onClick={() => setPreview(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
                <div style={{ marginTop: 12 }}>
                  {preview.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview.url} alt={preview.alt || 'File preview'} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />
                  ) : (
                    <div>{preview.text}</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
    </main>
  );
}
