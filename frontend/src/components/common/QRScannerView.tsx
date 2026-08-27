import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Camera, AlertCircle } from 'lucide-react';

interface QRScannerViewProps {
  onScanSuccess: (decodedText: string) => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({ onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualAsset, setManualAsset] = useState('');

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;

    codeReader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result && isMounted) {
          onScanSuccess(result.getText());
        }
      })
      .catch((err) => {
        console.error('Camera Access Error:', err);
        if (isMounted) {
          setErrorMsg('Camera access is restricted or not supported by this browser. Use manual lookup below.');
        }
      });

    return () => {
      isMounted = false;
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAsset.trim()) {
      onScanSuccess(manualAsset.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '450px', margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#0F172A',
          aspectRatio: '1/1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
          playsInline
        />
        {errorMsg && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#FFFFFF',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '0.75rem'
            }}
          >
            <AlertCircle size={32} color="var(--warning)" />
            <p style={{ fontSize: '0.875rem' }}>{errorMsg}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <Input
          label="Manual Asset Number Entry"
          placeholder="e.g. AST-LPT-001"
          value={manualAsset}
          onChange={(e) => setManualAsset(e.target.value)}
        />
        <Button type="submit" variant="primary">
          <Camera size={18} /> Open
        </Button>
      </form>
    </div>
  );
};