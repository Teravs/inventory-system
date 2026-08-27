import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/inventory', label: 'Inventory', icon: <Boxes size={20} /> },
    { to: '/scanner', label: 'QR Scanner', icon: <QrCode size={20} /> },
    ...(user?.role === 'SUPER_ADMIN'
      ? [
          { to: '/categories', label: 'Categories', icon: <Tags size={20} /> },
          { to: '/users', label: 'Users', icon: <Users size={20} /> }
        ]
      : []),
    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
      ? [{ to: '/activity-logs', label: 'Activity Logs', icon: <FileText size={20} /> }]
      : [])
  ];

  return (
    <>
      {/* Semi-transparent backdrop overlay on front layer */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 49,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.25s ease, visibility 0.25s ease'
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
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          zIndex: 50,
          boxShadow: isOpen ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Boxes size={24} /> AssetKeeper
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Internal Inventory System</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-sub)',
              padding: '0.375rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', backgroundColor: '#F8FAFC' }}>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</div>
            <div style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>@{user?.username} ({user?.role})</div>
          </div>
          <button
            onClick={logout}
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
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--danger)',
              transition: 'background 0.15s ease'
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
    </>
  );
};