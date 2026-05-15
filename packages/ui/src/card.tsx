import type { PropsWithChildren } from 'react';

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-200/60 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}
