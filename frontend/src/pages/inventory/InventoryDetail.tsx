import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { InventoryItem } from '../../types';
import { QRDisplay } from '../../components/common/QRDisplay';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const InventoryDetailPage: React.FC = () => {
  const { assetNumber } = useParams<{ assetNumber: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/inventory/${assetNumber}`);
        setItem(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Asset not found');
      } finally {
        setLoading(false);
      }
    };
    if (assetNumber) fetchDetail();
  }, [assetNumber]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading asset specifications...</div>;
  if (error || !item) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error || 'Not found'}</div>;

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => navigate('/inventory')} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} /> Back to Inventory
      </Button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Detail Card */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{item.assetNumber}</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{item.name}</h1>
              <p style={{ color: 'var(--text-sub)' }}>{item.brand || 'Standard Issue'}</p>
            </div>
            <Badge variant={item.status}>{item.status}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem', display: 'block' }}>Category</span>
              <strong>{item.category?.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem', display: 'block' }}>Serial Number</span>
              <strong>{item.serialNumber || '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem', display: 'block' }}>Assigned Person</span>
              <strong>{item.assignedTo || 'Unassigned'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.8rem', display: 'block' }}>Purchase Month</span>
              <strong>{item.purchaseMonth}</strong>
            </div>
          </div>

          {user?.role !== 'VIEWER' && item.devicePassword && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Device Access Password</span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.8rem' }}
                >
                  {showPassword ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
                </button>
              </div>
              <div style={{ marginTop: '0.25rem', fontFamily: 'monospace', fontWeight: 600 }}>
                {showPassword ? item.devicePassword : '••••••••••••'}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-sub)' }}>
            <div>Created by: {item.createdBy?.name} on {new Date(item.createdAt).toLocaleDateString()}</div>
            <div>Last update by: {item.updatedBy?.name} on {new Date(item.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* QR Code Container */}
        <div>
          <QRDisplay value={item.qrCode} assetNumber={item.assetNumber} />
        </div>
      </div>
    </div>
  );
};