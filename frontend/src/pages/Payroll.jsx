import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const formatRupiah = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

const MONTHS = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const Payroll = () => {
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const now = new Date();
  const [form, setForm] = useState({
    period_month: now.getMonth() + 1,
    period_year: now.getFullYear(),
    details: [],
  });

  const fetchData = async () => {
    try {
      const [payrollsRes, empRes] = await Promise.all([
        api.get('/payrolls'),
        api.get('/payroll-employees'),
      ]);
      setData(payrollsRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    // Pre-fill detail dari semua karyawan
    const details = employees.map(e => ({
      employee_id: e.id,
      employee_name: e.name,
      position: e.position,
      base_salary: e.base_salary,
      commission: 0,
    }));
    setForm({ period_month: now.getMonth() + 1, period_year: now.getFullYear(), details });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/payrolls/${id}`);
      setDetail(res.data);
      setShowDetail(true);
    } catch {
      Swal.fire('Error', 'Gagal memuat detail', 'error');
    }
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDetailChange = (idx, field, value) => {
    setForm(prev => {
      const details = [...prev.details];
      details[idx] = { ...details[idx], [field]: value };
      return { ...prev, details };
    });
  };

  const calcTotal = () =>
    form.details.reduce((sum, d) => sum + Number(d.base_salary) + Number(d.commission || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.details.length === 0) {
      Swal.fire('Peringatan', 'Tidak ada karyawan', 'warning'); return;
    }
    setSaving(true);
    try {
      await api.post('/payrolls', {
        period_month: Number(form.period_month),
        period_year: Number(form.period_year),
        details: form.details.map(d => ({
          employee_id: d.employee_id,
          base_salary: Number(d.base_salary),
          commission: Number(d.commission || 0),
        })),
      });
      Swal.fire('Berhasil', 'Payroll berhasil dibuat', 'success');
      closeModal();
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Payroll?',
      text: 'Data payroll akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BA7517',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/payrolls/${id}`);
      Swal.fire('Terhapus!', 'Payroll berhasil dihapus', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus', 'error');
    }
  };

  const filtered = data.filter(d =>
    `${MONTHS[d.period_month]} ${d.period_year}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page active">
      <div className="page-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Cari payroll..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', width: '100%' }} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fas fa-plus"></i>Buat Payroll
        </button>
      </div>

      <div className="card">
        {loading ? <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Memuat data...</p> : (
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th style={{ textAlign: 'center' }}>Jumlah Karyawan</th>
                <th style={{ textAlign: 'right' }}>Total Gaji</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{MONTHS[item.period_month]} {item.period_year}</td>
                  <td style={{ textAlign: 'center' }}>{item.employee_count} karyawan</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-accent)' }}>
                    {formatRupiah(item.total_amount)}
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <span className="action-btn" title="Detail" onClick={() => openDetail(item.id)}>
                      <i className="fas fa-eye"></i>
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

      {/* Modal Buat Payroll */}
      <div className={`modal ${showModal ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="modal-content" style={{ maxWidth: '680px' }}>
          <div className="modal-header">
            <span className="modal-title">Buat Payroll</span>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Bulan <span style={{ color: 'red' }}>*</span></label>
                  <select className="form-select" name="period_month" value={form.period_month} onChange={handleFormChange}>
                    {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tahun <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input" type="number" name="period_year" value={form.period_year}
                    onChange={handleFormChange} min="2020" max="2099" />
                </div>
              </div>

              <div style={{ marginBottom: '8px', fontWeight: 600, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                DATA GAJI KARYAWAN
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Jabatan</th>
                      <th>Gaji Pokok</th>
                      <th>Komisi (Rp)</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.details.map((d, idx) => (
                      <tr key={d.employee_id}>
                        <td>{d.employee_name}</td>
                        <td>{d.position}</td>
                        <td>{formatRupiah(d.base_salary)}</td>
                        <td>
                          <input
                            type="number" min="0"
                            value={d.commission}
                            onChange={e => handleDetailChange(idx, 'commission', e.target.value)}
                            style={{ width: '100px', padding: '4px 6px', border: '0.5px solid var(--color-border-secondary)', borderRadius: '4px', fontSize: '12px' }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatRupiah(Number(d.base_salary) + Number(d.commission || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '10px', marginTop: '10px' }}>
                Total Penggajian: {formatRupiah(calcTotal())}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={closeModal}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Payroll'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Detail */}
      <div className={`modal ${showDetail ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && setShowDetail(false)}>
        <div className="modal-content" style={{ maxWidth: '600px' }}>
          <div className="modal-header">
            <span className="modal-title">
              Detail Payroll — {detail && `${MONTHS[detail.period_month]} ${detail.period_year}`}
            </span>
            <button className="modal-close" onClick={() => setShowDetail(false)}>&times;</button>
          </div>
          {detail && (
            <div className="modal-body">
              <table>
                <thead>
                  <tr>
                    <th>Karyawan</th>
                    <th>Jabatan</th>
                    <th style={{ textAlign: 'right' }}>Gaji Pokok</th>
                    <th style={{ textAlign: 'right' }}>Komisi</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.details || []).map(d => (
                    <tr key={d.id}>
                      <td>{d.employee_name}</td>
                      <td>{d.position}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(d.base_salary)}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(d.commission)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(d.total_salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '10px', marginTop: '8px' }}>
                Total: {formatRupiah(detail.total_amount)}
              </div>
            </div>
          )}
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={() => setShowDetail(false)}>Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
