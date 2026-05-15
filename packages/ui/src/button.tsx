import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Button({ label, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}
