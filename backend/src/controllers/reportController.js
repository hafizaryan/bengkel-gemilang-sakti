const db = require('../configs/db');

// Ringkasan dashboard / laporan umum
exports.getSummary = async (req, res) => {
  try {
    const [[{ total_spareparts }]] = await db.query('SELECT COUNT(*) AS total_spareparts FROM spareparts');
    const [[{ total_suppliers }]] = await db.query('SELECT COUNT(*) AS total_suppliers FROM suppliers');
    const [[{ total_customers }]] = await db.query('SELECT COUNT(*) AS total_customers FROM customers');
    const [[{ total_employees }]] = await db.query('SELECT COUNT(*) AS total_employees FROM employees');
    const [[{ total_services }]] = await db.query('SELECT COUNT(*) AS total_services FROM services');
    const [[{ total_purchases }]] = await db.query('SELECT COUNT(*) AS total_purchases FROM purchases');

    const [[{ revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM services WHERE status = 'Selesai'"
    );
    const [[{ purchase_cost }]] = await db.query(
      'SELECT COALESCE(SUM(total_amount), 0) AS purchase_cost FROM purchases'
    );
    const [[{ low_stock }]] = await db.query(
      'SELECT COUNT(*) AS low_stock FROM spareparts WHERE stock <= 10'
    );

    res.json({
      total_spareparts,
      total_suppliers,
      total_customers,
      total_employees,
      total_services,
      total_purchases,
      revenue,
      purchase_cost,
      low_stock,
    });
  } catch (err) {
    console.error('Error getSummary:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Laporan service per bulan (12 bulan terakhir)
exports.getServiceReport = async (req, res) => {
  try {
    const [monthly] = await db.query(`
      SELECT
        MONTH(created_at) AS month,
        YEAR(created_at) AS year,
        COUNT(*) AS total_service,
        SUM(total_amount) AS total_revenue,
        SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) AS selesai,
        SUM(CASE WHEN status = 'Proses' THEN 1 ELSE 0 END) AS proses,
        SUM(CASE WHEN status = 'Menunggu' THEN 1 ELSE 0 END) AS menunggu
      FROM services
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year DESC, month DESC
    `);

    const [byStatus] = await db.query(`
      SELECT status, COUNT(*) AS total FROM services GROUP BY status
    `);

    const [topMechanics] = await db.query(`
      SELECT e.name, COUNT(s.id) AS total_service, SUM(s.total_amount) AS total_revenue
      FROM services s
      LEFT JOIN employees e ON s.mechanic_id = e.id
      WHERE e.id IS NOT NULL
      GROUP BY e.id, e.name
      ORDER BY total_service DESC
      LIMIT 5
    `);

    res.json({ monthly, byStatus, topMechanics });
  } catch (err) {
    console.error('Error getServiceReport:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Laporan pembelian per bulan
exports.getPurchaseReport = async (req, res) => {
  try {
    const [monthly] = await db.query(`
      SELECT
        MONTH(created_at) AS month,
        YEAR(created_at) AS year,
        COUNT(*) AS total_purchase,
        SUM(total_amount) AS total_cost
      FROM purchases
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year DESC, month DESC
    `);

    const [topSuppliers] = await db.query(`
      SELECT s.name AS supplier_name, COUNT(p.id) AS total_purchase, SUM(p.total_amount) AS total_cost
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      GROUP BY s.id, s.name
      ORDER BY total_cost DESC
      LIMIT 5
    `);

    const [topItems] = await db.query(`
      SELECT sp.code, sp.name, SUM(pd.quantity) AS total_qty, SUM(pd.subtotal) AS total_cost
      FROM purchase_details pd
      LEFT JOIN spareparts sp ON pd.sparepart_id = sp.id
      GROUP BY sp.id, sp.code, sp.name
      ORDER BY total_qty DESC
      LIMIT 10
    `);

    res.json({ monthly, topSuppliers, topItems });
  } catch (err) {
    console.error('Error getPurchaseReport:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Laporan stok sparepart
exports.getStockReport = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sp.code, sp.name, sp.stock, sp.buy_price, sp.sell_price,
        (sp.stock * sp.buy_price) AS stock_value,
        sup.name AS supplier_name
      FROM spareparts sp
      LEFT JOIN suppliers sup ON sp.supplier_id = sup.id
      ORDER BY sp.stock ASC
    `);

    const [[{ total_value }]] = await db.query(
      'SELECT COALESCE(SUM(stock * buy_price), 0) AS total_value FROM spareparts'
    );
    const [[{ low_stock_count }]] = await db.query(
      'SELECT COUNT(*) AS low_stock_count FROM spareparts WHERE stock <= 10'
    );
    const [[{ out_of_stock }]] = await db.query(
      'SELECT COUNT(*) AS out_of_stock FROM spareparts WHERE stock = 0'
    );

    res.json({ items: rows, total_value, low_stock_count, out_of_stock });
  } catch (err) {
    console.error('Error getStockReport:', err.message);
    res.status(500).json({ error: err.message });
  }
};
