import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { InventoryItem, Category } from '../../types';
import { QRDisplay } from '../../components/common/QRDisplay';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ArrowLeft, Eye, EyeOff, Edit2 } from 'lucide-react';

export const InventoryDetailPage: React.FC = () => {
  const { assetNumber } = useParams<{ assetNumber: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    serialNumber: '',
    assignedTo: '',
    devicePassword: '',
    purchaseMonth: ''
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?active=true');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (assetNumber) fetchDetail();
    fetchCategories();
  }, [assetNumber]);

  const openEditModal = () => {
    if (!item) return;
    setEditFormData({
      name: item.name,
      brand: item.brand || '',
      categoryId: String(item.categoryId || item.category?.id || ''),
      serialNumber: item.serialNumber || '',
      assignedTo: item.assignedTo || '',
      devicePassword: item.devicePassword || '',
      purchaseMonth: item.purchaseMonth || ''
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setEditError(null);
    setSaving(true);
    try {
      await api.put(`/inventory/${item.assetNumber}`, {
        name: editFormData.name.trim(),
        brand: editFormData.brand.trim() || null,
        categoryId: Number(editFormData.categoryId),
        serialNumber: editFormData.serialNumber.trim() || null,
        assignedTo: editFormData.assignedTo.trim() || null,
        devicePassword: editFormData.devicePassword ? editFormData.devicePassword : null,
        purchaseMonth: editFormData.purchaseMonth
      });
      setEditModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading asset specifications...</div>;
  if (error || !item) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error || 'Not found'}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={16} /> Back to Inventory
        </Button>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openEditModal}>
            <Edit2 size={16} /> Edit Asset
          </Button>
        )}
      </div>

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

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Asset: ${item.assetNumber}`}>
        {editError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{editError}</div>}
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Input
            label="Item Name"
            required
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
          />
          <Input
            label="Brand / Manufacturer"
            value={editFormData.brand}
            onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
          />
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Category *</label>
            <select
              required
              value={editFormData.categoryId}
              onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '0.25rem' }}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <Input
            label="Serial Number (Optional)"
            value={editFormData.serialNumber}
            onChange={(e) => setEditFormData({ ...editFormData, serialNumber: e.target.value })}
          />
          <Input
            label="Assigned Person"
            value={editFormData.assignedTo}
            onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
          />
          <Input
            label="Device Password"
            type="password"
            value={editFormData.devicePassword}
            onChange={(e) => setEditFormData({ ...editFormData, devicePassword: e.target.value })}
            placeholder="Enter new password or leave unchanged"
          />
          <Input
            label="Purchase Month (YYYY-MM)"
            type="month"
            required
            value={editFormData.purchaseMonth}
            onChange={(e) => setEditFormData({ ...editFormData, purchaseMonth: e.target.value })}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};