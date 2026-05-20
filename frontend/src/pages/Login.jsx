import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      Swal.fire('Berhasil', 'Login sukses', 'success');
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Login gagal', 'error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-image"></div>
        <div className="login-content">
          <div className="login-header">
            <div className="login-header-top">
              <div className="login-logo"><i className="fas fa-wrench"></i></div>
              <div>
                <h1 className="login-title">Gemilang Sakti</h1>
                <p className="login-subtitle">Workshop Motor</p>
              </div>
            </div>
            <p className="login-desc">Sistem Informasi Manajemen Bengkel Motor terpadu dengan fitur inventory, service, dan pembayaran</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><i className="fas fa-user"></i> Username</label>
              <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" />
            </div>
            <div className="form-group">
              <label className="form-label"><i className="fas fa-lock"></i> Password</label>
              <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" />
            </div>
            <div className="login-btn-wrapper">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-sign-in-alt"></i> Login Sekarang
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
            Demo: admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
