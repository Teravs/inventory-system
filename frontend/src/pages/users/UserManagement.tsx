import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { User, Role, Status } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { Plus, Edit, Trash2, Power, Users } from 'lucide-react';

export const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ user: User; nextStatus: Status } | null>(null);
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

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'VIEWER' as Role,
    status: 'ACTIVE' as Status
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'VIEWER',
      status: 'ACTIVE'
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      username: u.username,
      password: '',
      role: u.role,
      status: u.status
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          role: formData.role,
          status: formData.status
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }
        await api.put(`/users/${editingUser.id}`, payload);
        setModalOpen(false);
        fetchUsers();
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Akun Berhasil Diperbarui',
          message: `Perubahan profil akun @${formData.username.trim()} (${formData.name.trim()}) telah berhasil disimpan.`
        });
      } else {
        if (!formData.password.trim()) {
          setError('Password wajib diisi untuk pembuatan akun baru.');
          setSaving(false);
          return;
        }
        await api.post('/users', {
          name: formData.name.trim(),
          username: formData.username.trim(),
          password: formData.password.trim(),
          role: formData.role
        });
        setModalOpen(false);
        fetchUsers();
        setFeedback({
          isOpen: true,
          type: 'success',
          title: 'Akun Pengguna Dibuat',
          message: `Akun baru @${formData.username.trim()} (${formData.name.trim()}) dengan role ${formData.role} berhasil dibuat.`
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan data akun pengguna.';
      setError(errMsg);
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan Akun',
        message: errMsg
      });
    } finally {
      setSaving(false);
    }
  };

  const openStatusConfirm = (u: User) => {
    const nextStatus: Status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusTarget({ user: u, nextStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/users/${statusTarget.user.id}/status`, { status: statusTarget.nextStatus });
      const changedUser = statusTarget.user;
      const appliedStatus = statusTarget.nextStatus;
      setStatusTarget(null);
      fetchUsers();
      setFeedback({
        isOpen: true,
        type: appliedStatus === 'ACTIVE' ? 'success' : 'warning',
        title: appliedStatus === 'ACTIVE' ? 'Akun Berhasil Diaktifkan' : 'Akun Dinonaktifkan',
        message: `Status akun @${changedUser.username} (${changedUser.name}) berhasil diubah menjadi ${appliedStatus}.`
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal mengubah status akun.';
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      const deletedUser = deleteTarget;
      setDeleteTarget(null);
      fetchUsers();
      setFeedback({
        isOpen: true,
        type: 'success',
        title: 'Akun Pengguna Dihapus',
        message: `Akun pengguna @${deletedUser.username} (${deletedUser.name}) telah berhasil dihapus permanen.`
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menghapus akun pengguna.';
      setFeedback({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus Akun',
        message: errMsg
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              User Accounts
            </h1>
            <span
              style={{
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid #E9D5FF'
              }}
            >
              {users.length} Users
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.2rem' }}>
            Manage internal employee access credentials and role authorizations
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={17} /> Add User
        </Button>
      </div>

      <div className="modern-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Username</th>
                <th>System Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
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
                    Loading system accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-sub)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-sub)' }}>
                        @{u.username}
                      </span>
                    </td>
                    <td>
                      <Badge variant={u.role}>{u.role}</Badge>
                    </td>
                    <td>
                      <Badge variant={u.status}>{u.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(u)}
                          title="Edit user"
                          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusConfirm(u)}
                          title={u.status === 'ACTIVE' ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Power size={16} color={u.status === 'ACTIVE' ? 'var(--warning)' : 'var(--success)'} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(u)}
                          title="Delete user"
                          style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                        >
                          <Trash2 size={16} color="var(--danger)" />
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? `Edit User: @${editingUser.username}` : 'Create User Account'}>
        {error && (
          <div style={{ color: 'var(--danger)', backgroundColor: '#FEF2F2', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', marginBottom: '1rem', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
          />
          <Input
            label="Username"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="e.g. johndoe"
          />
          <Input
            label={editingUser ? 'New Password (Leave blank to keep unchanged)' : 'Password'}
            type="password"
            required={!editingUser}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editingUser ? '••••••••' : 'Enter secure password'}
          />
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
              System Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
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
              <option value="VIEWER">VIEWER (Read Only)</option>
              <option value="ADMIN">ADMIN (Inventory Operator)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Controller)</option>
            </select>
          </div>

          {editingUser && (
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
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
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Permanent Delete User */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        variant="danger"
        title="Konfirmasi Hapus Akun"
        message={`Apakah Anda yakin ingin menghapus akun @${deleteTarget?.username} (${deleteTarget?.name}) secara permanen?\n\nTindakan ini tidak dapat dibatalkan dan akan dicatat dalam Audit Trail.`}
        confirmText="Ya, Hapus Akun"
        cancelText="Batal"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirmation Modal for User Status Toggle */}
      <ConfirmDialog
        isOpen={!!statusTarget}
        variant="warning"
        title={statusTarget?.nextStatus === 'ACTIVE' ? 'Konfirmasi Aktivasi Akun' : 'Konfirmasi Nonaktifkan Akun'}
        message={
          statusTarget?.nextStatus === 'ACTIVE'
            ? `Apakah Anda yakin ingin mengaktifkan kembali akun @${statusTarget?.user.username} (${statusTarget?.user.name})? Pengguna akan dapat login kembali.`
            : `Apakah Anda yakin ingin menonaktifkan akun @${statusTarget?.user.username} (${statusTarget?.user.name})? Pengguna tidak akan dapat mengakses sistem.`
        }
        confirmText={statusTarget?.nextStatus === 'ACTIVE' ? 'Ya, Aktifkan' : 'Ya, Nonaktifkan'}
        cancelText="Batal"
        isLoading={actionLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusTarget(null)}
      />

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