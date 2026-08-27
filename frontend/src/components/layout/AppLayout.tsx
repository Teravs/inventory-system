import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar rendered as a front-layer modal drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            height: '60px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle menu"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                transition: 'background 0.15s ease'
              }}
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              AssetKeeper
            </span>
          </div>

          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-sub)' }}>
            Internal Company Network
          </span>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};