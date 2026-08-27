import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScannerView } from '../../components/common/QRScannerView';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleScanSuccess = (decoded: string) => {
    // Check if the decoded payload is an internal URL or just the assetNumber
    if (decoded.includes('/inventory/')) {
      const parts = decoded.split('/inventory/');
      const asset = parts[parts.length - 1];
      navigate(`/inventory/${asset}`);
    } else {
      navigate(`/inventory/${encodeURIComponent(decoded)}`);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Asset QR Scanner</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
        Align the inventory label QR code within the viewfinder
      </p>
      <QRScannerView onScanSuccess={handleScanSuccess} />
    </div>
  );
};