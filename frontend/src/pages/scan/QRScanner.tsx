import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScannerView } from '../../components/common/QRScannerView';
import { QrCode } from 'lucide-react';

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
    <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div
          style={{
            display: 'inline-flex',
            padding: '0.65rem',
            background: 'var(--primary-gradient)',
            borderRadius: '12px',
            color: '#FFFFFF',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
          }}
        >
          <QrCode size={26} />
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Asset QR Scanner
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
          Align the physical hardware QR label within the viewfinder
        </p>
      </div>

      <div className="modern-card" style={{ padding: '1.5rem' }}>
        <QRScannerView onScanSuccess={handleScanSuccess} />
      </div>
    </div>
  );
};