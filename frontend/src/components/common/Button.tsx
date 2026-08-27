import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  style,
  ...props
}) => {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 500,
      borderRadius: 'var(--radius-md)',
      border: '1px solid transparent',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      transition: 'background-color 0.15s ease, border-color 0.15s ease',
      fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
      padding: size === 'sm' ? '0.375rem 0.75rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.5rem 1rem'
    };

    if (variant === 'primary') {
      return { ...base, backgroundColor: 'var(--primary)', color: '#FFFFFF', ...style };
    }
    if (variant === 'secondary') {
      return { ...base, backgroundColor: 'var(--secondary)', color: '#FFFFFF', ...style };
    }
    if (variant === 'danger') {
      return { ...base, backgroundColor: 'var(--danger)', color: '#FFFFFF', ...style };
    }
    if (variant === 'outline') {
      return { ...base, backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text-main)', ...style };
    }
    return { ...base, backgroundColor: 'transparent', color: 'var(--text-main)', ...style };
  };

  return (
    <button style={getStyles()} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span>Loading...</span> : children}
    </button>
  );
};