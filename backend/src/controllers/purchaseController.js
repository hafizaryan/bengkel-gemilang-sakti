const db = require('../configs/db');

// Get all purchases dengan info supplier
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, s.name AS supplier_name,
        (SELECT COUNT(*) FROM purchase_details pd WHERE pd.purchase_id = p.id) AS item_count
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error getAll purchases:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get purchase by id beserta detail items
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(`
      SELECT p.*, s.name AS supplier_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pembelian tidak ditemukan' });

    const [details] = await db.query(`
      SELECT pd.*, sp.code AS sparepart_code, sp.name AS sparepart_name
      FROM purchase_details pd
      LEFT JOIN spareparts sp ON pd.sparepart_id = sp.id
      WHERE pd.purchase_id = ?
    `, [id]);

    res.json({ ...rows[0], details });
  } catch (err) {
    console.error('Error getById purchase:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Create purchase beserta detail items, update stok sparepart
exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { invoice_no, supplier_id, items } = req.body;
    if (!invoice_no || !supplier_id || !items || items.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Invoice, supplier, dan minimal 1 item harus diisi' });
    }

    // Cek invoice duplikat
    const [dup] = await conn.query('SELECT id FROM purchases WHERE invoice_no = ?', [invoice_no]);
    if (dup.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Nomor invoice sudah digunakan' });
    }

    // Hitung total
    let total_amount = 0;
    for (const item of items) {
      total_amount += Number(item.buy_price) * Number(item.quantity);
    }

    // Insert purchase header
    const [result] = await conn.query(
      'INSERT INTO purchases (invoice_no, supplier_id, total_amount, created_at) VALUES (?, ?, ?, NOW())',
      [invoice_no, supplier_id, total_amount]
    );
    const purchase_id = result.insertId;

    // Insert detail + update stok
    for (const item of items) {
      const subtotal = Number(item.buy_price) * Number(item.quantity);
      await conn.query(
        'INSERT INTO purchase_details (purchase_id, sparepart_id, quantity, buy_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [purchase_id, item.sparepart_id, item.quantity, item.buy_price, subtotal]
      );
      // Tambah stok sparepart
      await conn.query(
        'UPDATE spareparts SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.sparepart_id]
      );
    }

    await conn.commit();
    conn.release();

    const [newData] = await db.query(`
      SELECT p.*, s.name AS supplier_name FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?
    `, [purchase_id]);

    res.status(201).json({ message: 'Pembelian berhasil disimpan', data: newData[0] });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error create purchase:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete purchase (stok dikembalikan)
exports.remove = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const id = req.params.id;

    const [existing] = await conn.query('SELECT * FROM purchases WHERE id = ?', [id]);
    if (existing.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Pembelian tidak ditemukan' });
    }

    // Ambil detail untuk kembalikan stok
    const [details] = await conn.query('SELECT * FROM purchase_details WHERE purchase_id = ?', [id]);
    for (const d of details) {
      await conn.query('UPDATE spareparts SET stock = stock - ? WHERE id = ?', [d.quantity, d.sparepart_id]);
    }

    await conn.query('DELETE FROM purchases WHERE id = ?', [id]);
    await conn.commit();
    conn.release();

    res.json({ message: 'Pembelian berhasil dihapus', deletedId: id });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error delete purchase:', err.message);
    res.status(500).json({ error: err.message });
  }
};
