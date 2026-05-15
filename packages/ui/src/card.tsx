import type { PropsWithChildren, CSSProperties } from 'react';

const cardStyle: CSSProperties = {
  borderRadius: 28,
  border: '1px solid rgba(148, 163, 184, 0.22)',
  backgroundColor: 'rgba(255,255,255,0.95)',
  padding: 24,
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(14px)',
};

export function Card({ children, className = '', style }: PropsWithChildren<{ className?: string; style?: CSSProperties }>) {
  return (
    <div style={{ ...cardStyle, ...style }} className={className}>
      {children}
    </div>
  );
}
