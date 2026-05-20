import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const emptyForm = { code: '', name: '', position: '', base_salary: '' };

const formatRupiah = (val) =>
  'Rp ' + Number(val).toLocaleString('id-ID');

const Karyawan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/employees');
      setData(res.data);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat data karyawan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ code: item.code, name: item.name, position: item.position, base_salary: item.base_salary });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.position || !form.base_salary) {
      Swal.fire('Peringatan', 'Semua field wajib diisi', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, base_salary: Number(form.base_salary) };
      if (editId) {
        await api.put(`/employees/${editId}`, payload);
        Swal.fire('Berhasil', 'Karyawan berhasil diupdate', 'success');
      } else {
        await api.post('/employees', payload);
        Swal.fire('Berhasil', 'Karyawan berhasil ditambahkan', 'success');
      }
      closeModal();
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Karyawan?',
      text: 'Data yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BA7517',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/employees/${id}`);
      Swal.fire('Terhapus!', 'Karyawan berhasil dihapus', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus data', 'error');
    }
  };

  const filtered = data.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page active">
      <div className="page-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari karyawan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', width: '100%' }}
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fas fa-plus"></i>Tambah Karyawan
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Memuat data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Gaji Pokok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><span className="inline-tag">{item.code}</span></td>
                  <td>{item.name}</td>
                  <td>{item.position}</td>
                  <td>{formatRupiah(item.base_salary)}</td>
                  <td>
                    <span className="action-btn" title="Edit" onClick={() => openEdit(item)}>
                      <i className="fas fa-edit"></i>
                    </span>&nbsp;
                    <span className="action-btn" title="Hapus" onClick={() => handleDelete(item.id)}>
                      <i className="fas fa-trash"></i>
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <div className={`modal ${showModal ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-title">{editId ? 'Edit Karyawan' : 'Tambah Karyawan'}</span>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Kode Karyawan <span style={{ color: 'red' }}>*</span></label>
                <input className="form-input" name="code" value={form.code} onChange={handleChange} placeholder="Contoh: KRY-004" required />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Karyawan <span style={{ color: 'red' }}>*</span></label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Nama lengkap" required />
              </div>
              <div className="form-group">
                <label className="form-label">Jabatan <span style={{ color: 'red' }}>*</span></label>
                <select className="form-select" name="position" value={form.position} onChange={handleChange} required>
                  <option value="">-- Pilih Jabatan --</option>
                  <option value="Mekanik">Mekanik</option>
                  <option value="Kasir">Kasir</option>
                  <option value="Admin">Admin</option>
                  <option value="Kepala Mekanik">Kepala Mekanik</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Gaji Pokok (Rp) <span style={{ color: 'red' }}>*</span></label>
                <input className="form-input" type="number" name="base_salary" value={form.base_salary} onChange={handleChange} placeholder="Contoh: 3000000" min="0" required />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={closeModal}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Karyawan;
