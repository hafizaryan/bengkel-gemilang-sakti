import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const emptyForm = {
  invoice_no: '',
  motorcycle_id: '',
  mechanic_id: '',
  status: 'Menunggu',
  complaint: '',
  service_fee: '',
  total_amount: '',
};

const formatRupiah = (val) =>
  'Rp ' + Number(val).toLocaleString('id-ID');

const statusBadge = (status) => {
  if (status === 'Selesai') return <span className="badge badge-success">{status}</span>;
  if (status === 'Proses') return <span className="badge badge-warning">{status}</span>;
  return <span className="badge badge-info">{status}</span>;
};

const ServiceMotor = () => {
  const [data, setData] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [servicesRes, motorcyclesRes, employeesRes] = await Promise.all([
        api.get('/services'),
        api.get('/motorcycles'),
        api.get('/employees'),
      ]);
      setData(servicesRes.data);
      setMotorcycles(motorcyclesRes.data);
      setEmployees(employeesRes.data);
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
      invoice_no: item.invoice_no,
      motorcycle_id: item.motorcycle_id,
      mechanic_id: item.mechanic_id || '',
      status: item.status,
      complaint: item.complaint || '',
      service_fee: item.service_fee,
      total_amount: item.total_amount,
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
    if (!form.invoice_no || !form.motorcycle_id) {
      Swal.fire('Peringatan', 'No. Invoice dan Motor harus diisi', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        motorcycle_id: Number(form.motorcycle_id),
        mechanic_id: form.mechanic_id ? Number(form.mechanic_id) : null,
        service_fee: Number(form.service_fee) || 0,
        total_amount: Number(form.total_amount) || 0,
      };
      if (editId) {
        await api.put(`/services/${editId}`, payload);
        Swal.fire('Berhasil', 'Service berhasil diupdate', 'success');
      } else {
        await api.post('/services', payload);
        Swal.fire('Berhasil', 'Service berhasil ditambahkan', 'success');
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
      title: 'Hapus Service?',
      text: 'Data yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BA7517',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/services/${id}`);
      Swal.fire('Terhapus!', 'Service berhasil dihapus', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus data', 'error');
    }
  };

  const filtered = data.filter(d =>
    d.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
    (d.status || '').toLowerCase().includes(search.toLowerCase())
  );

  // Cari nama motor dari id
  const getMotorcycleLabel = (id) => {
    const m = motorcycles.find(m => m.id === id);
    return m ? `${m.police_no} - ${m.type}` : id;
  };

  // Cari nama mekanik dari id
  const getMechanicName = (id) => {
    const e = employees.find(e => e.id === id);
    return e ? e.name : '-';
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', width: '100%' }}
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fas fa-plus"></i>Tambah Service
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Memuat data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>No. Invoice</th>
                <th>Motor</th>
                <th>Mekanik</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><span className="inline-tag">{item.invoice_no}</span></td>
                  <td>{getMotorcycleLabel(item.motorcycle_id)}</td>
                  <td>{getMechanicName(item.mechanic_id)}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.complaint || '-'}
                  </td>
                  <td>{statusBadge(item.status)}</td>
                  <td>{formatRupiah(item.total_amount)}</td>
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
            <span className="modal-title">{editId ? 'Edit Service' : 'Tambah Service'}</span>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">No. Invoice <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input" name="invoice_no" value={form.invoice_no} onChange={handleChange} placeholder="SV-091" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Proses">Proses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Motor <span style={{ color: 'red' }}>*</span></label>
                <select className="form-select" name="motorcycle_id" value={form.motorcycle_id} onChange={handleChange} required>
                  <option value="">-- Pilih Motor --</option>
                  {motorcycles.map(m => (
                    <option key={m.id} value={m.id}>{m.police_no} - {m.type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mekanik</label>
                <select className="form-select" name="mechanic_id" value={form.mechanic_id} onChange={handleChange}>
                  <option value="">-- Pilih Mekanik --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Keluhan</label>
                <textarea className="form-input" name="complaint" value={form.complaint} onChange={handleChange} placeholder="Deskripsi keluhan" rows={2} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Biaya Jasa (Rp)</label>
                  <input className="form-input" type="number" name="service_fee" value={form.service_fee} onChange={handleChange} placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Total (Rp)</label>
                  <input className="form-input" type="number" name="total_amount" value={form.total_amount} onChange={handleChange} placeholder="0" min="0" />
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

export default ServiceMotor;
