"use client";

export default function OnboardingModal({ onClose }: { onClose?: () => void }) {
  return (
    <div className="onboard-modal" role="dialog">
      <div className="onboard-panel">
        <h3>Setup is quick</h3>
        <ol>
          <li>Create an account</li>
          <li>Pick a folder to sync</li>
          <li>QRD akan mengamankan file secara otomatis</li>
        </ol>
        <button onClick={() => { localStorage.setItem('qrd.onboarded','1'); onClose?.(); }}>Start syncing</button>
      </div>
    </div>
  );
}
