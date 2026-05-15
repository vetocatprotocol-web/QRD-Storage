'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@qrd/ui';
import { Card } from '@qrd/ui';
import { LogoIcon } from '@qrd/ui';
import { registerDevice, createUploadSession } from '../../lib/api';
import { getAccessToken, saveTokens, clearTokens } from '../../lib/session';

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

  useEffect(() => {
    setAccessToken(getAccessToken());
  }, []);

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

  return (
    <main className="page-shell">
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
              <Button label="Create upload session" onClick={handleCreateUploadSession} />
            </div>
          </div>
        </Card>

        {status ? (
          <Card style={{ padding: 24 }}>
            <p style={{ margin: 0, color: '#0f172a' }}>{status}</p>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
