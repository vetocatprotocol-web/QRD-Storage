"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccessToken } from '../lib/session';

export default function TopBar() {
  const [syncState, setSyncState] = useState('idle');
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) setShowOnboard(true);
    // naive sync indicator toggle from localStorage
    const id = setInterval(() => {
      const pending = Number(localStorage.getItem('qrd.pending') || '0');
      setSyncState(pending > 0 ? 'syncing' : 'idle');
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <Link href="/">QRD Storage</Link>
      </div>
      <div className="topbar-right">
        <div className={`sync-indicator ${syncState}`}>{syncState === 'syncing' ? 'Syncing…' : 'Idle'}</div>
        <button className="btn-link" onClick={() => setShowOnboard(true)}>What is QRD?</button>
      </div>
      {showOnboard ? (
        <div className="onboard-modal" role="dialog">
          <div className="onboard-panel">
            <h3>Welcome to QRD Storage</h3>
            <p>Files are encrypted locally, uploaded directly to cloud storage, and verified. Your password never leaves your device.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowOnboard(false); localStorage.setItem('qrd.onboarded','1'); }}>Got it</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
