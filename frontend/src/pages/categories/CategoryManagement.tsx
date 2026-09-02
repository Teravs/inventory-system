import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Category, Status } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Plus, Power, Edit, Tags } from 'lucide-react';

export const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name: name.trim() });
      } else {
        await api.post('/categories', { name: name.trim() });
      }
      setModalOpen(false);
      setName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (category: Category) => {
    const nextStatus: Status = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/categories/${category.id}/status`, { status: nextStatus });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Categories
            </h1>
            <span
              style={{
                backgroundColor: '#F0F9FF',
                color: 'var(--secondary)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid #BAE6FD'
              }}
            >
              {categories.length} Categories
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            Manage asset taxonomy, groups, and device classifications
          </p>
        </div>
        <Button variant="primary" onClick={() => { setEditingCategory(null); setName(''); setModalOpen(true); }}>
          <Plus size={17} /> Add Category
        </Button>
      </div>

      <div className="modern-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Assigned Items</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
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
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                    <Tags size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No categories registered.</p>
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {c.name}
                    </td>
                    <td>
                      <span style={{ backgroundColor: '#F1F5F9', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                        {c._count?.inventories ?? 0} items
                      </span>
                    </td>
                    <td>
                      <Badge variant={c.status}>{c.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingCategory(c); setName(c.name); setModalOpen(true); }}
                          title="Edit Category"
                          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(c)}
                          title="Toggle Status"
                          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Power size={16} color={c.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)'} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        {error && (
          <div style={{ color: 'var(--danger)', backgroundColor: '#FEF2F2', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', marginBottom: '1rem', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Category Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Server Racks & UPS"
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={saving}>Save Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};