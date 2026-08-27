import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from './Button';
import { Download } from 'lucide-react';

interface QRDisplayProps {
  value: string;
  assetNumber: string;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ value, assetNumber }) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPng = () => {
    const canvasElement = qrContainerRef.current?.querySelector('canvas');
    if (!canvasElement) return;

    // Export only the pure QR code as PNG image
    const imageUri = canvasElement.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUri;
    downloadLink.download = `QR_${assetNumber}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        ref={qrContainerRef}
        style={{
          padding: '0.75rem',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}
      >
        <QRCodeCanvas
          value={value}
          size={240}
          level="H"
          includeMargin={true}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
          {assetNumber}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
          Scan to view hardware detail
        </span>
      </div>

      <Button variant="primary" size="md" onClick={handleDownloadPng} style={{ width: '100%' }}>
        <Download size={18} /> Download QR (PNG)
      </Button>
    </div>
  );
};