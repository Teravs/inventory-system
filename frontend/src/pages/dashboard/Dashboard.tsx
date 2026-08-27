import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { Boxes, CheckCircle, XCircle, Tags, Users } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading system summary...</div>;
  if (!data) return null;

  const cards = [
    { label: 'Total Inventory', value: data.cards.totalInventory, icon: <Boxes size={24} color="var(--primary)" /> },
    { label: 'Active Items', value: data.cards.activeInventory, icon: <CheckCircle size={24} color="var(--success)" /> },
    { label: 'Inactive Items', value: data.cards.inactiveInventory, icon: <XCircle size={24} color="var(--danger)" /> },
    { label: 'Active Categories', value: data.cards.totalCategories, icon: <Tags size={24} color="var(--secondary)" /> },
    { label: 'Active Users', value: data.cards.totalUsers, icon: <Users size={24} color="#6D28D9" /> }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Overview Dashboard</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>System-wide physical asset metrics</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cards.map((c) => (
          <div key={c.label} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{c.label}</span>
              {c.icon}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Recently Registered Assets</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.5rem' }}>Asset Number</th>
                <th style={{ padding: '0.5rem' }}>Name</th>
                <th style={{ padding: '0.5rem' }}>Category</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentItems.map((item) => (
                <tr key={item.assetNumber} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{item.assetNumber}</td>
                  <td style={{ padding: '0.5rem' }}>{item.name}</td>
                  <td style={{ padding: '0.5rem' }}>{item.category.name}</td>
                  <td style={{ padding: '0.5rem' }}><Badge variant={item.status}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};