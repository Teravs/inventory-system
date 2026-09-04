import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface FeedbackModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  buttonText = 'Tutup',
  onClose
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={32} color="#059669" />,
          bgColor: '#ECFDF5',
          borderColor: '#A7F3D0',
          btnVariant: 'primary' as const
        };
      case 'error':
        return {
          icon: <XCircle size={32} color="#DC2626" />,
          bgColor: '#FEF2F2',
          borderColor: '#FECACA',
          btnVariant: 'danger' as const
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={32} color="#D97706" />,
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
          btnVariant: 'primary' as const
        };
      case 'info':
      default:
        return {
          icon: <Info size={32} color="#EA580C" />,
          bgColor: '#FFF7ED',
          borderColor: '#FED7AA',
          btnVariant: 'primary' as const
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem 0' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: config.bgColor,
            border: `1px solid ${config.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.04)'
          }}
        >
          {config.icon}
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>

        <Button
          variant={config.btnVariant}
          size="md"
          onClick={onClose}
          style={{ minWidth: '130px' }}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

