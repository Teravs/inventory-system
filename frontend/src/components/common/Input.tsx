import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, style, ...props }, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
      {label && <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</label>}
      <input
        ref={ref}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          backgroundColor: 'var(--surface)',
          color: 'var(--text-main)',
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)',
          ...style
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{helperText}</span>}
    </div>
  );
});
Input.displayName = 'Input';