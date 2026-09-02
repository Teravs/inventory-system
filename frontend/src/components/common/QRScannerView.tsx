import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AlertCircle, ArrowRight } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '420px', margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#0F172A',
          aspectRatio: '1/1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          border: '2px solid #334155'
        }}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          muted
          playsInline
        />

        {/* Viewfinder Target Box */}
        {!errorMsg && (
          <div
            style={{
              position: 'absolute',
              width: '65%',
              height: '65%',
              border: '2px solid rgba(59, 130, 246, 0.7)',
              borderRadius: '16px',
              boxShadow: '0 0 0 4000px rgba(15, 23, 42, 0.45)',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #38BDF8, transparent)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
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
            <AlertCircle size={32} color="#F59E0B" />
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#E2E8F0' }}>{errorMsg}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <Input
          label="Manual Asset Number Lookup"
          placeholder="e.g. AST-LPT-001"
          value={manualAsset}
          onChange={(e) => setManualAsset(e.target.value)}
        />
        <Button type="submit" variant="primary">
          Open <ArrowRight size={16} />
        </Button>
      </form>
    </div>
  );
};