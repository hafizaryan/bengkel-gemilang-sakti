import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard';
  };

  if (!user) return null; // Will be redirected by ProtectedRoute

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <div className="logo-icon">
              <i className="fas fa-wrench"></i>
            </div>
            <div>
              <div className="logo-text">Gemilang Sakti</div>
              <div className="logo-sub">Sistem Bengkel Motor</div>
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div className="nav-section">Utama</div>
          <div className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
            <i className="fas fa-home"></i>Dashboard
          </div>

          <div className="nav-section">Master Data</div>
          <div className={`nav-item ${location.pathname === '/spareparts' ? 'active' : ''}`} onClick={() => navigate('/spareparts')}>
            <i className="fas fa-box"></i>Sparepart
          </div>
          <div className={`nav-item ${location.pathname === '/suppliers' ? 'active' : ''}`} onClick={() => navigate('/suppliers')}>
            <i className="fas fa-store"></i>Supplier
          </div>
          <div className={`nav-item ${location.pathname === '/customers' ? 'active' : ''}`} onClick={() => navigate('/customers')}>
            <i className="fas fa-users"></i>Customer
          </div>
          <div className={`nav-item ${location.pathname === '/employees' ? 'active' : ''}`} onClick={() => navigate('/employees')}>
            <i className="fas fa-id-card"></i>Karyawan
          </div>

          <div className="nav-section">Transaksi</div>
          <div className={`nav-item ${location.pathname === '/purchases' ? 'active' : ''}`} onClick={() => navigate('/purchases')}>
            <i className="fas fa-truck"></i>Pembelian
          </div>
          <div className={`nav-item ${location.pathname === '/sales' ? 'active' : ''}`} onClick={() => navigate('/sales')}>
            <i className="fas fa-shopping-cart"></i>Penjualan
          </div>
          <div className={`nav-item ${location.pathname === '/services' ? 'active' : ''}`} onClick={() => navigate('/services')}>
            <i className="fas fa-cog"></i>Service Motor
          </div>

          <div className="nav-section">Manajemen</div>
          <div className={`nav-item ${location.pathname === '/payrolls' ? 'active' : ''}`} onClick={() => navigate('/payrolls')}>
            <i className="fas fa-money-bill-wave"></i>Payroll
          </div>
          <div className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`} onClick={() => navigate('/reports')}>
            <i className="fas fa-chart-bar"></i>Laporan
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="user-chip" style={{ cursor: 'pointer' }} onClick={logout}>
            <div className="user-avatar">{user?.username?.substring(0, 2).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}><i className="fas fa-sign-out-alt"></i></div>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{getPageTitle()}</div>
          <div className="topbar-actions">
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', padding: '4px 10px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '20px' }}>
              <i className="fas fa-calendar"></i> {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
