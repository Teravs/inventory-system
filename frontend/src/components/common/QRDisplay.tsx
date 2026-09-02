import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from './Button';
import { Download, QrCode } from 'lucide-react';

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
      className="modern-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-sub)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <QrCode size={15} /> Physical QR Label
      </div>

      <div
        ref={qrContainerRef}
        style={{
          padding: '0.85rem',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <QRCodeCanvas
          value={value}
          size={220}
          level="H"
          includeMargin={true}
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', letterSpacing: '0.02em', display: 'block' }}>
          {assetNumber}
        </span>
        <span style={{ fontSize: '0.775rem', color: 'var(--text-sub)' }}>
          Scan to quickly pull up hardware record
        </span>
      </div>

      <Button variant="primary" size="md" onClick={handleDownloadPng} style={{ width: '100%' }}>
        <Download size={17} /> Download QR (PNG)
      </Button>
    </div>
  );
};