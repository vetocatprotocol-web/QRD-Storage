import type { ButtonHTMLAttributes, CSSProperties } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  style?: CSSProperties;
}

const buttonStyle: CSSProperties = {
  borderRadius: 16,
  backgroundColor: '#0f172a',
  color: '#ffffff',
  border: 'none',
  padding: '0.85rem 1.25rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.15s ease, background-color 0.15s ease',
};

export function Button({ label, className = '', style, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      style={{ ...buttonStyle, ...style }}
      className={className}
      onMouseEnter={(event) => {
        (event.currentTarget.style as any).transform = 'translateY(-1px)';
      }}
      onMouseLeave={(event) => {
        (event.currentTarget.style as any).transform = 'translateY(0px)';
      }}
      {...props}
    >
      {label}
    </button>
  );
}
