import Link from 'next/link';
import { LogoIcon } from '@qrd/ui';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="landing-panel">
        <div className="landing-copy">
          <LogoIcon className="logo-icon" />
          <p className="eyebrow">QRD Storage</p>
          <h1>Encrypted background sync that feels effortless.</h1>
          <p className="page-copy">
            Secure your device data with local encryption, direct cloud uploads, and automatic storage optimization.
          </p>
          <div className="button-row">
            <Link href="/register" className="button button-primary">
              Create account
            </Link>
            <Link href="/login" className="button button-secondary">
              Sign in
            </Link>
          </div>
        </div>
        <div className="landing-panel-card">
          <div className="panel-content">
            <p className="eyebrow">Key platform capabilities</p>
            <ul className="feature-list">
              <li>Client-side AES-256-GCM encryption</li>
              <li>Direct Backblaze B2 signed uploads</li>
              <li>Zero-trust sync experience</li>
              <li>Lightweight device-first UI</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
