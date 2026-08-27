import React from 'react';

interface BadgeProps {
  variant: 'ACTIVE' | 'INACTIVE' | 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER' | string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const getBadgeStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'ACTIVE':
        return { backgroundColor: '#DCFCE7', color: '#15803D' };
      case 'INACTIVE':
        return { backgroundColor: '#F1F5F9', color: '#64748B' };
      case 'SUPER_ADMIN':
        return { backgroundColor: '#EDE9FE', color: '#6D28D9' };
      case 'ADMIN':
        return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
      case 'VIEWER':
        return { backgroundColor: '#E0F2FE', color: '#0369A1' };
      default:
        return { backgroundColor: '#F1F5F9', color: '#334155' };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        ...getBadgeStyle()
      }}
    >
      {children}
    </span>
  );
};