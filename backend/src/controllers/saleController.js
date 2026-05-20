const db = require('../configs/db');

// Get all sales dengan info customer
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, c.name AS customer_name,
        (SELECT COUNT(*) FROM sale_details sd WHERE sd.sale_id = s.id) AS item_count
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error getAll sales:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get sale by id beserta detail items
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query(`
      SELECT s.*, c.name AS customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Penjualan tidak ditemukan' });

    const [details] = await db.query(`
      SELECT sd.*, sp.code AS sparepart_code, sp.name AS sparepart_name
      FROM sale_details sd
      LEFT JOIN spareparts sp ON sd.sparepart_id = sp.id
      WHERE sd.sale_id = ?
    `, [id]);

    res.json({ ...rows[0], details });
  } catch (err) {
    console.error('Error getById sale:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Create sale beserta detail items, kurangi stok sparepart
exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { invoice_no, customer_id, items } = req.body;
    if (!invoice_no || !items || items.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Invoice dan minimal 1 item harus diisi' });
    }

    // Cek invoice duplikat
    const [dup] = await conn.query('SELECT id FROM sales WHERE invoice_no = ?', [invoice_no]);
    if (dup.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Nomor invoice sudah digunakan' });
    }

    // Validasi stok cukup untuk setiap item
    for (const item of items) {
      const [sp] = await conn.query('SELECT stock, name FROM spareparts WHERE id = ?', [item.sparepart_id]);
      if (sp.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: `Sparepart tidak ditemukan` });
      }
      if (sp[0].stock < Number(item.quantity)) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: `Stok ${sp[0].name} tidak cukup (tersisa ${sp[0].stock})` });
      }
    }

    // Hitung total
    let total_amount = 0;
    for (const item of items) {
      total_amount += Number(item.sell_price) * Number(item.quantity);
    }

    // Insert sale header
    const [result] = await conn.query(
      'INSERT INTO sales (invoice_no, customer_id, total_amount, created_at) VALUES (?, ?, ?, NOW())',
      [invoice_no, customer_id || null, total_amount]
    );
    const sale_id = result.insertId;

    // Insert detail + kurangi stok
    for (const item of items) {
      const subtotal = Number(item.sell_price) * Number(item.quantity);
      await conn.query(
        'INSERT INTO sale_details (sale_id, sparepart_id, quantity, sell_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [sale_id, item.sparepart_id, item.quantity, item.sell_price, subtotal]
      );
      await conn.query(
        'UPDATE spareparts SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.sparepart_id]
      );
    }

    await conn.commit();
    conn.release();

    const [newData] = await db.query(`
      SELECT s.*, c.name AS customer_name FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id WHERE s.id = ?
    `, [sale_id]);

    res.status(201).json({ message: 'Penjualan berhasil disimpan', data: newData[0] });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error create sale:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete sale (stok dikembalikan)
exports.remove = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const id = req.params.id;

    const [existing] = await conn.query('SELECT * FROM sales WHERE id = ?', [id]);
    if (existing.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Penjualan tidak ditemukan' });
    }

    // Kembalikan stok
    const [details] = await conn.query('SELECT * FROM sale_details WHERE sale_id = ?', [id]);
    for (const d of details) {
      await conn.query('UPDATE spareparts SET stock = stock + ? WHERE id = ?', [d.quantity, d.sparepart_id]);
    }

    await conn.query('DELETE FROM sales WHERE id = ?', [id]);
    await conn.commit();
    conn.release();

    res.json({ message: 'Penjualan berhasil dihapus', deletedId: id });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error delete sale:', err.message);
    res.status(500).json({ error: err.message });
  }
};
