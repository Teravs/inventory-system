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
      fontWeight: 600,
      borderRadius: 'var(--radius-md)',
      border: '1px solid transparent',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.65 : 1,
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      fontSize: size === 'sm' ? '0.8125rem' : size === 'lg' ? '1rem' : '0.875rem',
      padding: size === 'sm' ? '0.4rem 0.85rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.55rem 1.15rem',
      boxShadow: variant === 'primary' ? '0 2px 8px rgba(220, 38, 38, 0.28), 0 1px 2px rgba(234, 88, 12, 0.2)' : 'var(--shadow-xs)',
      userSelect: 'none'
    };

    if (variant === 'primary') {
      return {
        ...base,
        background: 'var(--primary-gradient)',
        color: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...style
      };
    }
    if (variant === 'secondary') {
      return {
        ...base,
        backgroundColor: 'var(--secondary)',
        color: '#FFFFFF',
        ...style
      };
    }
    if (variant === 'danger') {
      return {
        ...base,
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        boxShadow: '0 1px 2px 0 rgba(239, 68, 68, 0.25)',
        ...style
      };
    }
    if (variant === 'outline') {
      return {
        ...base,
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border)',
        color: 'var(--text-main)',
        boxShadow: 'var(--shadow-xs)',
        ...style
      };
    }
    return {
      ...base,
      backgroundColor: 'transparent',
      color: 'var(--text-main)',
      boxShadow: 'none',
      ...style
    };
  };

  return (
    <button style={getStyles()} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <span
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: '#FFFFFF',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.6s linear infinite'
            }}
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};