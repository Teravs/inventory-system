import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ActivityLog } from '../../types';
import { Badge } from '../../components/common/Badge';

export const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/activity-logs');
        setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Audit & Activity Logs</h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
        Immutable audit trail for all user and inventory management actions
      </p>

      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
              <th style={{ padding: '0.75rem 1rem' }}>Operator</th>
              <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              <th style={{ padding: '0.75rem 1rem' }}>Entity</th>
              <th style={{ padding: '0.75rem 1rem' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading audit entries...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>No logs recorded yet.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><strong>{log.user?.name}</strong> (@{log.user?.username})</td>
                  <td style={{ padding: '0.75rem 1rem' }}><Badge variant={log.action}>{log.action}</Badge></td>
                  <td style={{ padding: '0.75rem 1rem' }}>{log.entityType}: {log.entityId}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{log.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};