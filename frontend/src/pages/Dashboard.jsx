import React from 'react';

const Dashboard = () => {
  return (
    <div className="page active">
      <div className="grid-4" style={{ marginBottom: '16px' }}>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-wrench" style={{ color: '#BA7517' }}></i>Total Service</div>
          <div className="stat-value">247</div>
          <div className="stat-sub">↑ 12% bulan ini</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-money-bill-wave" style={{ color: '#0F6E56' }}></i>Pendapatan</div>
          <div className="stat-value" style={{ fontSize: '16px' }}>Rp 48,2jt</div>
          <div className="stat-sub">↑ 8% dari bulan lalu</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-box" style={{ color: '#993C1D' }}></i>Stok Menipis</div>
          <div className="stat-value">5</div>
          <div className="stat-sub down">Perlu restock</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="fas fa-clock" style={{ color: '#185FA5' }}></i>Service Aktif</div>
          <div className="stat-value">8</div>
          <div className="stat-sub">Sedang dikerjakan</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
