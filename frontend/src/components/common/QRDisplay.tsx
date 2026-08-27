import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../common/Button';
import { Printer } from 'lucide-react';

interface QRDisplayProps {
  value: string;
  assetNumber: string;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ value, assetNumber }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=400,height=400');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Asset QR - ${assetNumber}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 20px; }
              h2 { margin-bottom: 5px; font-size: 16px; }
              p { margin-top: 5px; font-size: 12px; color: #555; }
            </style>
          </head>
          <body>
            <h2>Company Asset: ${assetNumber}</h2>
            <div id="print-area"></div>
            <p>${value}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)' }}>
      <QRCodeSVG value={value} size={160} level="M" />
      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{assetNumber}</span>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer size={16} /> Print QR Label
      </Button>
    </div>
  );
};