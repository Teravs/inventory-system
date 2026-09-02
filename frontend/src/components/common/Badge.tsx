import React from 'react';

interface BadgeProps {
  variant: 'ACTIVE' | 'INACTIVE' | 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER' | string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const getBadgeStyle = (): { bg: string; color: string; border: string; dot: string } => {
    switch (variant) {
      case 'ACTIVE':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' };
      case 'INACTIVE':
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', dot: '#94A3B8' };
      case 'SUPER_ADMIN':
        return { bg: '#FAF5FF', color: '#6D28D9', border: '#E9D5FF', dot: '#8B5CF6' };
      case 'ADMIN':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' };
      case 'VIEWER':
        return { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', dot: '#0EA5E9' };
      case 'CREATE':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' };
      case 'UPDATE':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' };
      case 'DELETE':
        return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', dot: '#EF4444' };
      case 'CHANGE_ROLE':
        return { bg: '#FAF5FF', color: '#6D28D9', border: '#E9D5FF', dot: '#8B5CF6' };
      case 'ACTIVATE':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: '#10B981' };
      case 'DEACTIVATE':
        return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: '#F59E0B' };
      default:
        return { bg: '#F8FAFC', color: '#334155', border: '#E2E8F0', dot: '#64748B' };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.02em',
        lineHeight: 1
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.dot,
          display: 'inline-block'
        }}
      />
      {children}
    </span>
  );
};