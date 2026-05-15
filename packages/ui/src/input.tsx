import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      <span className="mb-2 block text-slate-800">{label}</span>
      <input
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        {...props}
      />
    </label>
  );
}
