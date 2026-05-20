import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const formatRupiah = (val) => 'Rp ' + Number(val).toLocaleString('id-ID');

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const Reports = () => {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [serviceReport, setServiceReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/summary');
      setSummary(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchServiceReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/services');
      setServiceReport(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchPurchaseReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/purchases');
      setPurchaseReport(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock');
      setStockReport(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'summary' && !summary) fetchSummary();
    if (tab === 'service' && !serviceReport) fetchServiceReport();
    if (tab === 'purchase' && !purchaseReport) fetchPurchaseReport();
    if (tab === 'stock' && !stockReport) fetchStockReport();
  }, [tab]);

  const tabStyle = (t) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    background: tab === t ? 'var(--color-accent)' : 'var(--color-background-secondary)',
    color: tab === t ? '#fff' : 'var(--color-text-secondary)',
    transition: 'all 0.2s',
  });

  return (
    <div className="page active">
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button style={tabStyle('summary')} onClick={() => setTab('summary')}>
          <i className="fas fa-chart-pie" style={{ marginRight: '6px' }}></i>Ringkasan
        </button>
        <button style={tabStyle('service')} onClick={() => setTab('service')}>
          <i className="fas fa-cog" style={{ marginRight: '6px' }}></i>Laporan Service
        </button>
        <button style={tabStyle('purchase')} onClick={() => setTab('purchase')}>
          <i className="fas fa-truck" style={{ marginRight: '6px' }}></i>Laporan Pembelian
        </button>
        <button style={tabStyle('stock')} onClick={() => setTab('stock')}>
          <i className="fas fa-boxes" style={{ marginRight: '6px' }}></i>Laporan Stok
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Memuat laporan...</p>}

      {/* ===== RINGKASAN ===== */}
      {tab === 'summary' && summary && !loading && (
        <div>
          <div className="grid-4" style={{ marginBottom: '16px' }}>
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-box"></i> Sparepart</div>
              <div className="stat-value">{summary.total_spareparts}</div>
              <div className="stat-sub">{summary.low_stock} stok menipis</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-users"></i> Customer</div>
              <div className="stat-value">{summary.total_customers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-cog"></i> Total Service</div>
              <div className="stat-value">{summary.total_services}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-id-card"></i> Karyawan</div>
              <div className="stat-value">{summary.total_employees}</div>
            </div>
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><i className="fas fa-money-bill-wave" style={{ marginRight: '6px', color: 'var(--color-accent)' }}></i>Pendapatan Service</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)' }}>
                {formatRupiah(summary.revenue)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Dari service yang sudah selesai
              </div>
            </div>
            <div className="card">
              <div className="section-title"><i className="fas fa-truck" style={{ marginRight: '6px', color: '#0C447C' }}></i>Total Pembelian</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0C447C' }}>
                {formatRupiah(summary.purchase_cost)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {summary.total_purchases} transaksi pembelian
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LAPORAN SERVICE ===== */}
      {tab === 'service' && serviceReport && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-3">
            {(serviceReport.byStatus || []).map(s => (
              <div className="stat-card" key={s.status}>
                <div className="stat-label">
                  {s.status === 'Selesai' && <i className="fas fa-check-circle" style={{ color: '#27500A' }}></i>}
                  {s.status === 'Proses' && <i className="fas fa-spinner" style={{ color: '#633806' }}></i>}
                  {s.status === 'Menunggu' && <i className="fas fa-clock" style={{ color: '#0C447C' }}></i>}
                  &nbsp;{s.status}
                </div>
                <div className="stat-value">{s.total}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title">Service per Bulan</div>
            <table>
              <thead>
                <tr>
                  <th>Periode</th>
                  <th style={{ textAlign: 'center' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Selesai</th>
                  <th style={{ textAlign: 'center' }}>Proses</th>
                  <th style={{ textAlign: 'right' }}>Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {(serviceReport.monthly || []).map((m, i) => (
                  <tr key={i}>
                    <td>{MONTHS[m.month]} {m.year}</td>
                    <td style={{ textAlign: 'center' }}>{m.total_service}</td>
                    <td style={{ textAlign: 'center' }}><span className="badge badge-success">{m.selesai}</span></td>
                    <td style={{ textAlign: 'center' }}><span className="badge badge-warning">{m.proses}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(m.total_revenue)}</td>
                  </tr>
                ))}
                {(serviceReport.monthly || []).length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="section-title">Top Mekanik</div>
            <table>
              <thead>
                <tr>
                  <th>Nama Mekanik</th>
                  <th style={{ textAlign: 'center' }}>Jumlah Service</th>
                  <th style={{ textAlign: 'right' }}>Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {(serviceReport.topMechanics || []).map((m, i) => (
                  <tr key={i}>
                    <td>{m.name}</td>
                    <td style={{ textAlign: 'center' }}>{m.total_service}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(m.total_revenue)}</td>
                  </tr>
                ))}
                {(serviceReport.topMechanics || []).length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== LAPORAN PEMBELIAN ===== */}
      {tab === 'purchase' && purchaseReport && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="section-title">Pembelian per Bulan</div>
            <table>
              <thead>
                <tr>
                  <th>Periode</th>
                  <th style={{ textAlign: 'center' }}>Jumlah Transaksi</th>
                  <th style={{ textAlign: 'right' }}>Total Biaya</th>
                </tr>
              </thead>
              <tbody>
                {(purchaseReport.monthly || []).map((m, i) => (
                  <tr key={i}>
                    <td>{MONTHS[m.month]} {m.year}</td>
                    <td style={{ textAlign: 'center' }}>{m.total_purchase}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(m.total_cost)}</td>
                  </tr>
                ))}
                {(purchaseReport.monthly || []).length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="section-title">Top Supplier</div>
              <table>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th style={{ textAlign: 'center' }}>Transaksi</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(purchaseReport.topSuppliers || []).map((s, i) => (
                    <tr key={i}>
                      <td>{s.supplier_name}</td>
                      <td style={{ textAlign: 'center' }}>{s.total_purchase}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(s.total_cost)}</td>
                    </tr>
                  ))}
                  {(purchaseReport.topSuppliers || []).length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title">Item Terbanyak Dibeli</div>
              <table>
                <thead>
                  <tr>
                    <th>Sparepart</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(purchaseReport.topItems || []).map((it, i) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td style={{ textAlign: 'center' }}>{it.total_qty}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(it.total_cost)}</td>
                    </tr>
                  ))}
                  {(purchaseReport.topItems || []).length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== LAPORAN STOK ===== */}
      {tab === 'stock' && stockReport && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="grid-3">
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-boxes"></i> Nilai Total Stok</div>
              <div className="stat-value" style={{ fontSize: '16px' }}>{formatRupiah(stockReport.total_value)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-exclamation-triangle" style={{ color: '#633806' }}></i> Stok Menipis (≤10)</div>
              <div className="stat-value" style={{ color: '#633806' }}>{stockReport.low_stock_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><i className="fas fa-times-circle" style={{ color: '#791F1F' }}></i> Stok Habis</div>
              <div className="stat-value" style={{ color: '#791F1F' }}>{stockReport.out_of_stock}</div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">Detail Stok Sparepart</div>
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Supplier</th>
                  <th style={{ textAlign: 'center' }}>Stok</th>
                  <th style={{ textAlign: 'right' }}>Harga Beli</th>
                  <th style={{ textAlign: 'right' }}>Nilai Stok</th>
                </tr>
              </thead>
              <tbody>
                {(stockReport.items || []).map((it, i) => (
                  <tr key={i}>
                    <td><span className="inline-tag">{it.code}</span></td>
                    <td>{it.name}</td>
                    <td>{it.supplier_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      {it.stock <= 0
                        ? <span className="badge badge-danger">Habis</span>
                        : it.stock <= 10
                          ? <span className="badge badge-warning">{it.stock}</span>
                          : <span className="badge badge-success">{it.stock}</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(it.buy_price)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(it.stock_value)}</td>
                  </tr>
                ))}
                {(stockReport.items || []).length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
