import type { InputHTMLAttributes, CSSProperties } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  style?: CSSProperties;
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '0.75rem',
  color: '#334155',
  fontSize: '0.95rem',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 18,
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  padding: '0.85rem 1rem',
  color: '#0f172a',
  fontSize: '0.95rem',
  outline: 'none',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
};

export function Input({ label, className = '', style, ...props }: InputProps) {
  return (
    <label style={{ display: 'block', width: '100%', ...style }} className={className}>
      <span style={labelStyle}>{label}</span>
      <input style={inputStyle} {...props} />
    </label>
  );
}
