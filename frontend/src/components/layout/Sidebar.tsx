import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  LayoutDashboard, 
  Boxes, 
  QrCode, 
  Tags, 
  Users, 
  FileText, 
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { to: '/inventory', label: 'Inventory', icon: <Boxes size={19} /> },
    { to: '/scanner', label: 'QR Scanner', icon: <QrCode size={19} /> },
    ...(user?.role === 'SUPER_ADMIN'
      ? [
          { to: '/categories', label: 'Categories', icon: <Tags size={19} /> },
          { to: '/users', label: 'Users', icon: <Users size={19} /> }
        ]
      : []),
    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
      ? [{ to: '/activity-logs', label: 'Activity Logs', icon: <FileText size={19} /> }]
      : [])
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setLogoutConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Semi-transparent backdrop overlay on front layer */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 49,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Sidebar Drawer on front layer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '85vw',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          zIndex: 50,
          boxShadow: isOpen ? '0 25px 50px -12px rgba(15, 23, 42, 0.25)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="CHA Asset Logo"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                CHA Asset
              </h2>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                Inventory Management
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-sub)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ padding: '0.5rem 0.75rem 0.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Main Menu
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid #FED7AA' : '1px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)', backgroundColor: '#FAF9F8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', padding: '0.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.825rem',
                border: '1px solid #FFEDD5'
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Logged User'}
              </div>
              <div style={{ color: 'var(--text-sub)', fontSize: '0.725rem' }}>
                @{user?.username} · <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{user?.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setLogoutConfirmOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--danger)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'background-color 0.15s ease, border-color 0.15s ease'
            }}
          >
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      {/* Confirmation Modal for Log Out */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        variant="danger"
        title="Konfirmasi Keluar (Log Out)"
        message={`Apakah Anda yakin ingin keluar dari akun @${user?.username} (${user?.name})?\n\nAnda harus memasukkan kredensial login kembali untuk mengakses sistem inventaris.`}
        confirmText="Ya, Keluar Akun"
        cancelText="Batal"
        isLoading={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
};