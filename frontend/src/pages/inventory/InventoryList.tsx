import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { InventoryItem, Category, Status } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { Plus, Search, Eye, Edit2, Power, Trash2, Boxes } from 'lucide-react';

export const InventoryListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Dialog & Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ item: InventoryItem; nextStatus: Status } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback Notification Modal State
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

  // Form State
  const [formData, setFormData] = useState({
    assetNumber: '',
    serialNumber: '',
    name: '',
    brand: '',
    categoryId: '',
    assignedTo: '',
    devicePassword: '',
    description: '',
    purchaseMonth: new Date().toISOString().substring(0, 7)
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/inventory?${params.toString()}`);
      setItems(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?active=true');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      assetNumber: '',
      serialNumber: '',
      name: '',
      brand: '',
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      assignedTo: '',
      devicePassword: '',
      description: '',
      purchaseMonth: new Date().toISOString().substring(0, 7)
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      assetNumber: item.assetNumber,
      serialNumber: item.serialNumber || '',
      name: item.name,
      brand: item.brand || '',
      categoryId: String(item.categoryId || item.category?.id || ''),
      assignedTo: item.assignedTo || '',
      devicePassword: item.devicePassword || '',
      description: item.description || '',
      purchaseMonth: item.purchaseMonth || new Date().toISOString().substring(0, 7)
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem.assetNumber}`, {
          name: formData.name.trim(),
          brand: formData.brand.trim() || null,
          categoryId: Number(formData.categoryId),
          serialNumber: formData.serialNumber.trim() || null,
          assignedTo: formData.assignedTo.trim() || null,
          devicePassword: formData.devicePassword ? formData.devicePassword : null,
          description: formData.description.trim() || null,
          purchaseMonth: formData.purchaseMonth
        });
        setModalOpen(false);
        fetchItems();
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Perubahan Berhasil Disimpan',
          message: `Data barang "${formData.name}" (${editingItem.assetNumber}) telah berhasil diperbarui.`
        });
      } else {
        await api.post('/inventory', {
          assetNumber: formData.assetNumber.trim(),
          name: formData.name.trim(),
          brand: formData.brand.trim() || null,
          categoryId: Number(formData.categoryId),
          serialNumber: formData.serialNumber.trim() || null,
          assignedTo: formData.assignedTo.trim() || null,
          devicePassword: formData.devicePassword || null,
          description: formData.description.trim() || null,
          purchaseMonth: formData.purchaseMonth
        });
        setModalOpen(false);
        fetchItems();
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Barang Berhasil Didaftarkan',
          message: `Barang "${formData.name}" dengan kode aset ${formData.assetNumber.trim()} berhasil didaftarkan ke sistem.`
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan data barang.';
      setFormError(errMsg);
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan Data',
        message: errMsg
      });
    } finally {
      setSaving(false);
    }
  };

  const openStatusConfirm = (item: InventoryItem) => {
    const nextStatus: Status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusTarget({ item, nextStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/inventory/${statusTarget.item.assetNumber}/status`, { status: statusTarget.nextStatus });
      const changedItem = statusTarget.item;
      const appliedStatus = statusTarget.nextStatus;
      setStatusTarget(null);
      fetchItems();
      setFeedback({
        isOpen: true,
        type: appliedStatus === 'ACTIVE' ? 'success' : 'warning',
        title: appliedStatus === 'ACTIVE' ? 'Barang Berhasil Diaktifkan' : 'Barang Dinonaktifkan',
        message: `Status barang "${changedItem.name}" (${changedItem.assetNumber}) berhasil diubah menjadi ${appliedStatus}.`
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal mengubah status barang.';
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Mengubah Status',
        message: errMsg
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/inventory/${deleteTarget.assetNumber}`);
      const deletedItem = deleteTarget;
      setDeleteTarget(null);
      fetchItems();
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Barang Berhasil Dihapus',
        message: `Data aset "${deletedItem.name}" (${deletedItem.assetNumber}) telah dihapus secara permanen dari sistem.`
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menghapus data barang.';
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus Barang',
        message: errMsg
      });
    } finally {
      setActionLoading(false);
    }
  };

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Company Inventory
            </h1>
            <span
              style={{
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid #FED7AA'
              }}
            >
              {items.length} Assets
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            Track, assign, and manage physical hardware inventory
          </p>
        </div>

        {canManage && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus size={17} /> Register Asset
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div
        className="modern-card"
        style={{
          padding: '1rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.85rem',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Search asset, name, assigned person, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)'
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
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
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
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
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Table Box */}
      <div className="modern-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Asset #</th>
                <th>Name / Brand</th>
                <th>Category</th>
                <th>Assigned To</th>
                <th>Purchase Month</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
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
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                    <Boxes size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No inventory records found.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.assetNumber}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {item.assetNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                        {item.brand || '—'}
                        {item.description && (
                          <span style={{ marginLeft: '0.4rem', color: 'var(--text-muted)' }}>
                            · {item.description.length > 35 ? item.description.substring(0, 35) + '...' : item.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 600, color: '#EA580C' }}>
                        {item.category?.name || 'General'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.assignedTo || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>{item.purchaseMonth}</span>
                    </td>
                    <td>
                      <Badge variant={item.status}>{item.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/inventory/${item.assetNumber}`)}
                          title="View detail"
                          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Eye size={16} color="var(--primary)" />
                        </Button>
                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(item)}
                              title="Edit item"
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Edit2 size={16} color="var(--text-main)" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openStatusConfirm(item)}
                              title={item.status === 'ACTIVE' ? 'Nonaktifkan barang' : 'Aktifkan barang'}
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Power size={16} color={item.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)'} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(item)}
                              title="Delete item"
                              style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Trash2 size={16} color="var(--danger)" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create and Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Asset: ${editingItem.assetNumber}` : 'Register New Hardware Asset'}
      >
        {formError && (
          <div style={{ color: 'var(--danger)', backgroundColor: '#FEF2F2', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', marginBottom: '1rem', border: '1px solid #FECACA' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Input
            label="Asset Number (Primary Key)"
            required
            disabled={!!editingItem}
            value={formData.assetNumber}
            onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
            placeholder="e.g. AST-LPT-001"
            helperText={editingItem ? 'Asset number cannot be changed' : undefined}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Item Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ThinkPad T14s"
            />
            <Input
              label="Brand / Manufacturer"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g. Lenovo"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="e.g. SN-982347-XYZ"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Assigned Person"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="e.g. Budi Santoso"
            />
            <Input
              label="Purchase Month"
              type="month"
              required
              value={formData.purchaseMonth}
              onChange={(e) => setFormData({ ...formData, purchaseMonth: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
              Description / Specifications (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Intel Core i7, 16GB RAM, 512GB SSD, Condition: Brand New"
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
            value={formData.devicePassword}
            onChange={(e) => setFormData({ ...formData, devicePassword: e.target.value })}
            placeholder={editingItem ? 'Enter new device password or leave unchanged' : 'Optional password'}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {editingItem ? 'Save Changes' : 'Create Asset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Permanent Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        variant="danger"
        title="Konfirmasi Hapus Permanen"
        message={`Apakah Anda yakin ingin menghapus permanen aset "${deleteTarget?.name}" (${deleteTarget?.assetNumber})?\n\nTindakan ini bersifat permanen, tidak dapat dibatalkan, dan akan dicatat dalam Audit Trail.`}
        confirmText="Ya, Hapus Permanen"
        cancelText="Batal"
        isLoading={actionLoading}
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirmation Modal for Status Activation / Deactivation */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        variant="warning"
        title={statusTarget?.nextStatus === 'ACTIVE' ? 'Konfirmasi Aktivasi Barang' : 'Konfirmasi Nonaktifkan Barang'}
        message={
          statusTarget?.nextStatus === 'ACTIVE'
            ? `Apakah Anda yakin ingin mengaktifkan kembali aset "${statusTarget?.item.name}" (${statusTarget?.item.assetNumber})?`
            : `Apakah Anda yakin ingin menonaktifkan aset "${statusTarget?.item.name}" (${statusTarget?.item.assetNumber})?\n\nBarang yang nonaktif tidak akan muncul sebagai unit aktif operasional.`
        }
        confirmText={statusTarget?.nextStatus === 'ACTIVE' ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
        cancelText="Batal"
        isLoading={actionLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusTarget(null)}
      />

      {/* Reusable Feedback Notification Modal */}
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