import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Power, Trash2, HelpCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <Power size={22} color="#D97706" />,
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
          btnVariant: 'primary' as const
        };
      case 'primary':
        return {
          icon: <HelpCircle size={22} color="#2563EB" />,
          bgColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          btnVariant: 'primary' as const
        };
      case 'danger':
      default:
        return {
          icon: <Trash2 size={22} color="#DC2626" />,
          bgColor: '#FEF2F2',
          borderColor: '#FECACA',
          btnVariant: 'danger' as const
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: vStyle.bgColor,
            border: `1px solid ${vStyle.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {vStyle.icon}
        </div>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, marginTop: '0.2rem', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={vStyle.btnVariant} type="button" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
