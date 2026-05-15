"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@qrd/ui';

export default function OnboardingWalkthrough({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Welcome to QRD', body: 'Private-by-default cloud backups. Files are encrypted in your browser before upload.' },
    { title: 'Register a Device', body: 'Add this device so it can securely upload and verify files.' },
    { title: 'Background Sync', body: 'QRD will sync selected folders automatically in the background.' },
    { title: 'Storage Friendly', body: 'We use incremental uploads and deduplication to save your cloud storage.' },
  ];

  function finish() {
    try {
      localStorage.setItem('qrd.onboarded', '1');
    } catch (e) {
      // ignore
    }
    onClose?.();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    // focus primary button on mount
    setTimeout(() => (document.getElementById('onboard-primary') as HTMLButtonElement | null)?.focus(), 10);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="onboard-modal" role="dialog" aria-modal="true">
      <div className="onboard-panel" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{steps[step].title}</h3>
          <div style={{ color: '#64748b' }}>{step + 1}/{steps.length}</div>
        </div>
        <p style={{ marginTop: 12 }}>{steps[step].body}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <div>
            {step > 0 ? <Button label="Back" onClick={() => setStep((s) => Math.max(0, s - 1))} /> : null}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step < steps.length - 1 ? (
              <Button id="onboard-primary" label="Next" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} />
            ) : (
              <Button id="onboard-primary" label="Get started" onClick={finish} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
