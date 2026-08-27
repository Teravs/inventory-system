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
import { Plus, Search, Eye, Edit2, Power, Trash2 } from 'lucide-react';

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

  // Dialog State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    assetNumber: '',
    serialNumber: '',
    name: '',
    brand: '',
    categoryId: '',
    assignedTo: '',
    devicePassword: '',
    purchaseMonth: new Date().toISOString().substring(0, 7)
  });
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/inventory', formData);
      setCreateModalOpen(false);
      setFormData({
        assetNumber: '',
        serialNumber: '',
        name: '',
        brand: '',
        categoryId: '',
        assignedTo: '',
        devicePassword: '',
        purchaseMonth: new Date().toISOString().substring(0, 7)
      });
      fetchItems();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to register inventory item');
    }
  };

  const toggleStatus = async (assetNumber: string, currentStatus: Status) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/inventory/${assetNumber}/status`, { status: nextStatus });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/inventory/${deleteTarget}`);
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Company Inventory</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>Track all physical hardware, assets, and assignment statuses</p>
        </div>
        {canManage && (
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={18} /> Register Asset
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Input
          placeholder="Search asset, name, assigned user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Table Box */}
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Asset #</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Name / Brand</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Assigned To</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Purchased</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>Loading inventory records...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>No inventory records found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.assetNumber} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--primary)' }}>{item.assetNumber}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{item.brand || '—'}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.category?.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.assignedTo || 'Unassigned'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.purchaseMonth}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><Badge variant={item.status}>{item.status}</Badge></td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/inventory/${item.assetNumber}`)}>
                        <Eye size={16} />
                      </Button>
                      {canManage && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => toggleStatus(item.assetNumber, item.status)}>
                            <Power size={16} color={item.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)'} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item.assetNumber)}>
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

      {/* Creation Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register New Hardware Asset">
        {formError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{formError}</div>}
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Input label="Asset Number (Primary Key)" required value={formData.assetNumber} onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })} placeholder="e.g. AST-LPT-001" />
          <Input label="Item Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. ThinkPad T14s Gen 3" />
          <Input label="Brand / Manufacturer" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Lenovo" />
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Category *</label>
            <select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '0.25rem' }}>
              <option value="">Select Category</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <Input label="Serial Number (Optional)" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
          <Input label="Assigned Person (Name only)" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="e.g. Budi Santoso" />
          <Input label="Device Password (Hidden by default)" type="password" value={formData.devicePassword} onChange={(e) => setFormData({ ...formData, devicePassword: e.target.value })} />
          <Input label="Purchase Month (YYYY-MM)" type="month" required value={formData.purchaseMonth} onChange={(e) => setFormData({ ...formData, purchaseMonth: e.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Asset</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Permanently Delete Inventory Item"
        message={`Are you sure you want to permanently delete asset "${deleteTarget}"? This will be permanently removed and logged.`}
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};