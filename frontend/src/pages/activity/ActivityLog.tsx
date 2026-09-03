import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { ActivityLog } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { exportActivityLogsToPdf } from '../../utils/exportActivityLogPdf';
import { 
  FileText, 
  Clock, 
  FileDown, 
  Boxes 
} from 'lucide-react';

export const ActivityLogPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>(isSuperAdmin ? '' : 'INVENTORY');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (actionFilter) params.append('action', actionFilter);
      if (isSuperAdmin && entityFilter) {
        params.append('entityType', entityFilter);
      } else if (!isSuperAdmin) {
        params.append('entityType', 'INVENTORY');
      }
      params.append('limit', '100');

      const res = await api.get(`/activity-logs?${params.toString()}`);
      setLogs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, actionFilter, entityFilter, isSuperAdmin]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (actionFilter) params.append('action', actionFilter);
      if (isSuperAdmin && entityFilter) {
        params.append('entityType', entityFilter);
      } else if (!isSuperAdmin) {
        params.append('entityType', 'INVENTORY');
      }
      params.append('all', 'true');

      const res = await api.get(`/activity-logs?${params.toString()}`);
      const exportData: ActivityLog[] = res.data.data;

      if (!exportData || exportData.length === 0) {
        alert(`Tidak ada catatan aktivitas untuk periode ${selectedMonth}.`);
        return;
      }

      exportActivityLogsToPdf({
        logs: exportData,
        selectedMonth: selectedMonth || currentMonthStr,
        operatorName: user?.name || 'Administrator',
        operatorUsername: user?.username || 'admin'
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Gagal mengekspor laporan PDF. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  const formatMonthDisplay = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, 1);
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {isSuperAdmin ? 'System Audit & Activity Logs' : 'Inventory Activity Logs'}
            </h1>
            <span
              style={{
                backgroundColor: isSuperAdmin ? '#EDE9FE' : '#EFF6FF',
                color: isSuperAdmin ? '#6D28D9' : 'var(--primary)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: `1px solid ${isSuperAdmin ? '#DDD6FE' : '#DBEAFE'}`
              }}
            >
              {logs.length} Entries
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            {isSuperAdmin
              ? 'Riwayat audit menyeluruh (Aktivitas Data Barang, Manajemen Pengguna, dan Kategori)'
              : 'Riwayat log audit perubahan dan mutasi data barang inventaris hardware'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={handleExportPdf}
            isLoading={exporting}
            disabled={loading}
            style={{ boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}
          >
            <FileDown size={17} /> Export PDF ({selectedMonth ? formatMonthDisplay(selectedMonth) : 'Semua'})
          </Button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div
        className="modern-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center'
        }}
      >
        {/* Month Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Periode Bulan & Tahun
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Action Type Filter (Role-differentiated) */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Filter Jenis Aksi
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer'
            }}
          >
            {isSuperAdmin ? (
              <>
                <option value="">Semua Aksi (All Actions)</option>
                <option value="CREATE">CREATE (Tambah Data)</option>
                <option value="UPDATE">UPDATE (Perbarui Data)</option>
                <option value="DELETE">DELETE (Hapus Data)</option>
                <option value="CHANGE_ROLE">CHANGE_ROLE (Ganti Role Akun)</option>
                <option value="ACTIVATE">ACTIVATE (Aktivasi)</option>
                <option value="DEACTIVATE">DEACTIVATE (Nonaktifkan)</option>
              </>
            ) : (
              <>
                <option value="">Semua Aksi Barang (All Inventory Actions)</option>
                <option value="CREATE">CREATE (Pendaftaran Barang)</option>
                <option value="UPDATE">UPDATE (Perubahan Data Barang)</option>
                <option value="DELETE">DELETE (Penghapusan Barang)</option>
                <option value="ACTIVATE">ACTIVATE (Aktivasi Barang)</option>
                <option value="DEACTIVATE">DEACTIVATE (Nonaktifkan Barang)</option>
              </>
            )}
          </select>
        </div>

        {/* Entity Type Filter (Role-differentiated) */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Filter Target Entitas
          </label>
          {isSuperAdmin ? (
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
                boxShadow: 'var(--shadow-xs)',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Entitas (All Entities)</option>
              <option value="INVENTORY">INVENTORY (Data Barang)</option>
              <option value="USER">USER (Data Pengguna)</option>
              <option value="CATEGORY">CATEGORY (Kategori)</option>
            </select>
          ) : (
            <div
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Boxes size={16} />
              <span>INVENTORY (Data Barang)</span>
            </div>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="modern-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '170px' }}>Waktu / Tanggal</th>
                <th style={{ width: '180px' }}>Operator</th>
                <th style={{ width: '110px' }}>Aksi</th>
                <th style={{ width: '160px' }}>Entitas Target</th>
                <th>Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 0.75rem'
                      }}
                    />
                    Memuat log aktivitas periode {selectedMonth ? formatMonthDisplay(selectedMonth) : ''}...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                    <FileText size={36} style={{ margin: '0 auto 0.6rem', opacity: 0.35 }} />
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      Tidak Ada Catatan Log
                    </p>
                    <p style={{ fontSize: '0.825rem', marginTop: '0.25rem', color: 'var(--text-sub)' }}>
                      Belum ada riwayat aktivitas pada periode {selectedMonth ? formatMonthDisplay(selectedMonth) : 'yang dipilih'}.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-sub)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} /> {new Date(log.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.user?.name || 'System'}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-sub)' }}>
                        @{log.user?.username} · <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{log.user?.role}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={log.action}>{log.action}</Badge>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                        {log.entityType}: {log.entityId}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>
                      {log.description}
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