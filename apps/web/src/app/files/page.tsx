'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '../../lib/session';
import { getFiles } from '../../lib/api';
import { Card } from '@qrd/ui';
import { Button } from '@qrd/ui';

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

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
      <h1>Files</h1>
      {status ? <p>{status}</p> : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {files.map((f) => (
          <Card key={f.id} style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{f.fileName}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{f.contentType} — {String(f.fileSize)} bytes</div>
              </div>
              <div>
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/files/${f.id}/download`}>
                  <Button label="Download" />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
