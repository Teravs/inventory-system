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
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Edit2, 
  Calendar, 
  User, 
  Tag, 
  Hash, 
  KeyRound, 
  AlignLeft
} from 'lucide-react';

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
    description: '',
    purchaseMonth: ''
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Feedback Notification Modal
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

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
      description: item.description || '',
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
        description: editFormData.description.trim() || null,
        purchaseMonth: editFormData.purchaseMonth
      });
      setEditModalOpen(false);
      fetchDetail();
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Spesifikasi Berhasil Diperbarui',
        message: `Perubahan data spesifikasi pada aset "${editFormData.name}" (${item.assetNumber}) telah berhasil disimpan.`
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal memperbarui data aset.';
      setEditError(errMsg);
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Memperbarui Aset',
        message: errMsg
      });
    } finally {
      setSaving(false);
    }
  };

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-sub)' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 0.75rem'
          }}
        />
        Loading asset specifications...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="modern-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
        <p style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>
          {error || 'Asset not found'}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={16} /> Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={16} /> Back to Inventory
        </Button>
        {canManage && (
          <Button variant="primary" size="sm" onClick={openEditModal}>
            <Edit2 size={16} /> Edit Asset Specifications
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Detail Card */}
        <div className="modern-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                {item.assetNumber}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginTop: '0.15rem' }}>
                {item.name}
              </h1>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>{item.brand || 'Standard Issue Hardware'}</p>
            </div>
            <Badge variant={item.status}>{item.status}</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem', padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <Tag size={13} /> Category
              </span>
              <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>{item.category?.name}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <Hash size={13} /> Serial Number
              </span>
              <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                {item.serialNumber || '—'}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <User size={13} /> Assigned Person
              </span>
              <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>
                {item.assignedTo || 'Unassigned'}
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <Calendar size={13} /> Purchase Month
              </span>
              <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>
                {item.purchaseMonth}
              </strong>
            </div>
          </div>

          {/* Description / Specifications Section */}
          <div style={{ marginTop: '1.25rem', padding: '1.25rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <AlignLeft size={13} /> Description & Specifications
            </span>
            <p style={{ fontSize: '0.9rem', color: item.description ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {item.description || 'No description or technical specifications provided for this asset.'}
            </p>
          </div>

          {user?.role !== 'VIEWER' && item.devicePassword && (
            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-lg)', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <KeyRound size={14} /> Device Access Password
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {showPassword ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show Password</>}
                </button>
              </div>
              <div style={{ marginTop: '0.35rem', fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#1E3A8A' }}>
                {showPassword ? item.devicePassword : '••••••••••••'}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', fontSize: '0.775rem', color: 'var(--text-sub)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>Created by: <strong>{item.createdBy?.name}</strong> on {new Date(item.createdAt).toLocaleDateString()}</div>
            <div>Updated by: <strong>{item.updatedBy?.name}</strong> on {new Date(item.updatedAt).toLocaleDateString()}</div>
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
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
              Category *
            </label>
            <select
              required
              value={editFormData.categoryId}
              onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: '#FFFFFF',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                outline: 'none',
                boxShadow: 'var(--shadow-xs)'
              }}
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
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
              Description / Specifications (Optional)
            </label>
            <textarea
              rows={3}
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              placeholder="e.g. Intel Core i7, 16GB RAM, 512GB SSD"
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
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
      />
    </div>
  );
};