import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const formatRupiah = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');
const formatDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const emptyItem = { sparepart_id: '', quantity: 1, sell_price: '' };

const Sales = () => {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    invoice_no: '',
    customer_id: '',
    items: [{ ...emptyItem }],
  });

  const fetchData = async () => {
    try {
      const [salesRes, customersRes, sparepartsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/customers'),
        api.get('/spareparts'),
      ]);
      setData(salesRes.data);
      setCustomers(customersRes.data);
      setSpareparts(sparepartsRes.data);
    } catch (err) {
      Swal.fire('Error', 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setForm({ invoice_no: '', customer_id: '', items: [{ ...emptyItem }] });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setDetail(res.data);
      setShowDetail(true);
    } catch {
      Swal.fire('Error', 'Gagal memuat detail', 'error');
    }
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      // Auto-fill harga jual dari sparepart
      if (field === 'sparepart_id') {
        const sp = spareparts.find(s => s.id === Number(value));
        if (sp) items[idx].sell_price = sp.sell_price;
      }
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setForm(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));

  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const calcTotal = () =>
    form.items.reduce((sum, it) => sum + (Number(it.sell_price) * Number(it.quantity) || 0), 0);

  // Cek stok tersedia untuk item yang dipilih
  const getStock = (sparepart_id) => {
    const sp = spareparts.find(s => s.id === Number(sparepart_id));
    return sp ? sp.stock : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice_no) {
      Swal.fire('Peringatan', 'Nomor invoice harus diisi', 'warning');
      return;
    }
    for (const it of form.items) {
      if (!it.sparepart_id || !it.quantity || !it.sell_price) {
        Swal.fire('Peringatan', 'Lengkapi semua item penjualan', 'warning');
        return;
      }
      const stock = getStock(it.sparepart_id);
      if (Number(it.quantity) > stock) {
        const sp = spareparts.find(s => s.id === Number(it.sparepart_id));
        Swal.fire('Stok Tidak Cukup', `Stok ${sp?.name} hanya tersisa ${stock}`, 'warning');
        return;
      }
    }
    setSaving(true);
    try {
      await api.post('/sales', {
        invoice_no: form.invoice_no,
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        items: form.items.map(it => ({
          sparepart_id: Number(it.sparepart_id),
          quantity: Number(it.quantity),
          sell_price: Number(it.sell_price),
        })),
      });
      Swal.fire('Berhasil', 'Penjualan berhasil disimpan & stok diperbarui', 'success');
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
      title: 'Hapus Penjualan?',
      text: 'Stok sparepart akan dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BA7517',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/sales/${id}`);
      Swal.fire('Terhapus!', 'Penjualan berhasil dihapus', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Gagal menghapus', 'error');
    }
  };

  const filtered = data.filter(d =>
    d.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
    (d.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page active">
      <div className="page-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Cari penjualan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', width: '100%' }}
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <i className="fas fa-plus"></i>Tambah Penjualan
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
                <th>Customer</th>
                <th style={{ textAlign: 'center' }}>Jumlah Item</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td><span className="inline-tag">{item.invoice_no}</span></td>
                  <td>{item.customer_name || <span style={{ color: 'var(--color-text-tertiary)' }}>Umum</span>}</td>
                  <td style={{ textAlign: 'center' }}>{item.item_count} item</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(item.total_amount)}</td>
                  <td>{formatDate(item.created_at)}</td>
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
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== Modal Tambah Penjualan ===== */}
      <div
        className={`modal ${showModal ? 'active' : ''}`}
        onClick={e => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal-content" style={{ maxWidth: '660px' }}>
          <div className="modal-header">
            <span className="modal-title">Tambah Penjualan</span>
            <button className="modal-close" onClick={closeModal}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">No. Invoice <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className="form-input"
                    name="invoice_no"
                    value={form.invoice_no}
                    onChange={handleFormChange}
                    placeholder="SL-001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(opsional)</span></label>
                  <select
                    className="form-select"
                    name="customer_id"
                    value={form.customer_id}
                    onChange={handleFormChange}
                  >
                    <option value="">-- Umum / Tanpa Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '8px', fontWeight: 600, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                ITEM PENJUALAN
              </div>

              {form.items.map((item, idx) => {
                const stock = getStock(item.sparepart_id);
                const overStock = item.sparepart_id && Number(item.quantity) > stock;
                return (
                  <div
                    key={idx}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      {idx === 0 && <label className="form-label">Sparepart</label>}
                      <select
                        className="form-select"
                        value={item.sparepart_id}
                        onChange={e => handleItemChange(idx, 'sparepart_id', e.target.value)}
                        required
                      >
                        <option value="">-- Pilih --</option>
                        {spareparts.map(s => (
                          <option key={s.id} value={s.id} disabled={s.stock <= 0}>
                            {s.name} (stok: {s.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      {idx === 0 && <label className="form-label">Qty</label>}
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max={stock || undefined}
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        style={{ borderColor: overStock ? '#e53e3e' : undefined }}
                        required
                      />
                      {overStock && (
                        <div style={{ fontSize: '10px', color: '#e53e3e', marginTop: '2px' }}>
                          Maks {stock}
                        </div>
                      )}
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      {idx === 0 && <label className="form-label">Harga Jual</label>}
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={item.sell_price}
                        onChange={e => handleItemChange(idx, 'sell_price', e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      style={{
                        background: '#FCEBEB', border: 'none', borderRadius: '4px',
                        width: '28px', height: '32px', cursor: 'pointer', color: '#791F1F',
                        marginTop: idx === 0 ? '18px' : 0,
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                className="btn"
                onClick={addItem}
                style={{ marginBottom: '12px', fontSize: '11px' }}
              >
                <i className="fas fa-plus"></i> Tambah Item
              </button>

              <div style={{
                textAlign: 'right', fontWeight: 600, fontSize: '14px',
                borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '10px',
              }}>
                Total: {formatRupiah(calcTotal())}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={closeModal}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===== Modal Detail ===== */}
      <div
        className={`modal ${showDetail ? 'active' : ''}`}
        onClick={e => e.target === e.currentTarget && setShowDetail(false)}
      >
        <div className="modal-content" style={{ maxWidth: '560px' }}>
          <div className="modal-header">
            <span className="modal-title">Detail Penjualan</span>
            <button className="modal-close" onClick={() => setShowDetail(false)}>&times;</button>
          </div>
          {detail && (
            <div className="modal-body">
              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>No. Invoice</div>
                  <div style={{ fontWeight: 600 }}>{detail.invoice_no}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Customer</div>
                  <div style={{ fontWeight: 600 }}>{detail.customer_name || 'Umum'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Tanggal</div>
                  <div>{formatDate(detail.created_at)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Total</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                    {formatRupiah(detail.total_amount)}
                  </div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Sparepart</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Harga</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail.details || []).map(d => (
                    <tr key={d.id}>
                      <td>{d.sparepart_name}</td>
                      <td style={{ textAlign: 'center' }}>{d.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(d.sell_price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                textAlign: 'right', fontWeight: 700, fontSize: '14px',
                borderTop: '0.5px solid var(--color-border-tertiary)', paddingTop: '10px', marginTop: '8px',
              }}>
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

export default Sales;
