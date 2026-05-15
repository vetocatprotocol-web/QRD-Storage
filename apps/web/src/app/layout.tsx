import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'QRD Storage',
  description: 'Privacy-first encrypted cloud storage',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
