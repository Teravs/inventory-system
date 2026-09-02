import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div
          style={{
            padding: '0.65rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: variant === 'danger' ? '#FEF2F2' : '#EFF6FF',
            color: variant === 'danger' ? '#EF4444' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${variant === 'danger' ? '#FEE2E2' : '#DBEAFE'}`
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.6, marginTop: '0.2rem' }}>
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} type="button" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
