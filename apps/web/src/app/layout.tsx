import type { ReactNode } from 'react';
import Link from 'next/link';
import '../styles/globals.css';

export const metadata = {
  title: 'QRD Storage',
  description: 'Privacy-first encrypted cloud storage',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand">
              QRD Storage
            </Link>
            <nav className="site-nav">
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
