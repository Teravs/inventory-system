import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { 
  Boxes, 
  CheckCircle2, 
  XCircle, 
  Tags, 
  Users, 
  ArrowRight, 
  Plus, 
  Clock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-sub)' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }}
        />
        <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>Loading dashboard overview...</p>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      label: 'Total Inventory',
      value: data.cards.totalInventory,
      icon: <Boxes size={22} color="#DC2626" />,
      bg: '#FFF7ED',
      border: '#FFEDD5',
      accent: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)'
    },
    {
      label: 'Active Items',
      value: data.cards.activeInventory,
      icon: <CheckCircle2 size={22} color="#059669" />,
      bg: '#ECFDF5',
      border: '#A7F3D0',
      accent: 'linear-gradient(135deg, #10B981 0%, #047857 100%)'
    },
    {
      label: 'Inactive Items',
      value: data.cards.inactiveInventory,
      icon: <XCircle size={22} color="#64748B" />,
      bg: '#F8FAFC',
      border: '#E2E8F0',
      accent: 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
    },
    {
      label: 'Active Categories',
      value: data.cards.totalCategories,
      icon: <Tags size={22} color="#EA580C" />,
      bg: '#FFEDD5',
      border: '#FED7AA',
      accent: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)'
    },
    {
      label: 'Active Users',
      value: data.cards.totalUsers,
      icon: <Users size={22} color="#E11D48" />,
      bg: '#FFE4E6',
      border: '#FECDD3',
      accent: 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)'
    }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Overview Dashboard
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} /> {currentDate}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
            <Boxes size={16} /> All Assets
          </Button>
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
            <Button variant="primary" size="sm" onClick={() => navigate('/inventory')}>
              <Plus size={16} /> Register Asset
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.15rem'
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            className="modern-card"
            style={{
              padding: '1.35rem',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                {c.label}
              </span>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: c.bg,
                  border: `1px solid ${c.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {c.icon}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {c.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Registered Assets Section */}
      <div
        className="modern-card"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Recently Registered Assets
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            View Full Inventory <ArrowRight size={15} />
          </Button>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Asset Number</th>
                <th>Name & Brand</th>
                <th>Category</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                    <Boxes size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p>No inventory records registered yet.</p>
                  </td>
                </tr>
              ) : (
                data.recentItems.map((item) => (
                  <tr key={item.assetNumber}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {item.assetNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{item.brand || 'Standard Unit'}</div>
                    </td>
                    <td>
                      <span style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 600, color: '#EA580C' }}>
                        {item.category?.name || 'General'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={item.status}>{item.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/inventory/${item.assetNumber}`)}
                        style={{ color: 'var(--primary)', fontWeight: 600 }}
                      >
                        Detail <ArrowRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};