import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const emptyForm = { code: '', name: '', supplier_id: '', buy_price: '', sell_price: '', stock: '' };

const formatRupiah = (val) =>
  'Rp ' + Number(val).toLocaleString('id-ID');

const Sparepart = () => {
  const [data, setData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [sparepartsRes, suppliersRes] = await Promise.all([
        api.get('/spareparts'),
        api.get('/suppliers'),
      ]);
      setData(sparepartsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat data', 'error');
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
    setForm({
      code: item.code,
      name: item.name,
      supplier_id: item.supplier_id,
      buy_price: item.buy_price,
      sell_price: item.sell_price,
      stock: item.stock,
    });
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
    if (!form.code || !form.name || !form.supplier_id || !form.buy_price || !form.sell_price) {
      Swal.fire('Peringatan', 'Semua field wajib diisi', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        supplier_id: Number(form.supplier_id),
        buy_price: Number(form.buy_price),
        sell_price: Number(form.sell_price),
        stock: Number(form.stock) || 0,
      };
      if (editId) {
        await api.put(`/spareparts/${editId}`, payload);
        Swal.fire('Berhasil', 'Sparepart berhasil diupdate', 'success');
      } else {
        await api.post('/spareparts', payload);
        Swal.fire('Berhasil', 'Sparepart berhasil ditambahkan', 'success');
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
      title: 'Hapus Sparepart?',
      text: 'Data yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BA7517',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/spareparts/${id}`);
      Swal.fire('Terhapus!', 'Sparepart berhasil dihapus', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus data', 'error');
    }
  };

  const filtered = data.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const stockBadge = (stock) => {
    if (stock <= 0) return <span className="badge badge-danger">Habis</span>;
    if (stock <= 10) return <span className="badge badge-warning">{stock}</span>;
    return <span className="badge badge-success">{stock}</span>;
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari sparepart..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', width: '100%' }}
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fas fa-plus"></i>Tambah Sparepart
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
                <th>Nama Barang</th>
                <th>Supplier</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><span className="inline-tag">{item.code}</span></td>
                  <td>{item.name}</td>
                  <td>{item.supplier_name || '-'}</td>
                  <td>{formatRupiah(item.buy_price)}</td>
                  <td>{formatRupiah(item.sell_price)}</td>
                  <td>{stockBadge(item.stock)}</td>
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
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <div className={`modal ${showModal ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="modal-content">
          <div className="modal-header">
            <span className="modal-title">{editId ? 'Edit Sparepart' : 'Tambah Sparepart'}</span>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Kode <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input" name="code" value={form.code} onChange={handleChange} placeholder="SP-005" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stok</label>
                  <input className="form-input" type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nama Barang <span style={{ color: 'red' }}>*</span></label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Nama sparepart" required />
              </div>
              <div className="form-group">
                <label className="form-label">Supplier <span style={{ color: 'red' }}>*</span></label>
                <select className="form-select" name="supplier_id" value={form.supplier_id} onChange={handleChange} required>
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Harga Beli (Rp) <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input" type="number" name="buy_price" value={form.buy_price} onChange={handleChange} placeholder="0" min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Jual (Rp) <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input" type="number" name="sell_price" value={form.sell_price} onChange={handleChange} placeholder="0" min="0" required />
                </div>
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

export default Sparepart;
