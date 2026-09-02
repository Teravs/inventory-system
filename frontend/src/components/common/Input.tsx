import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, style, ...props }, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        style={{
          padding: '0.55rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          backgroundColor: '#FFFFFF',
          color: 'var(--text-main)',
          fontSize: '0.875rem',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
      {helperText && !error && <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{helperText}</span>}
    </div>
  );
});
Input.displayName = 'Input';