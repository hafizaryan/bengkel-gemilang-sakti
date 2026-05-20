const db = require('../configs/db');

// Tabel yang tidak punya kolom updated_at
const NO_UPDATED_AT = ['motorcycles', 'service_details', 'purchase_details', 'sale_details', 'payroll_details'];

exports.getAll = (table) => async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    console.error(`Error getAll ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getById = (table) => async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`Error getById ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.create = (table) => async (req, res) => {
  try {
    const data = { ...req.body };
    if (!NO_UPDATED_AT.includes(table)) {
      data.created_at = new Date();
    }
    const [result] = await db.query(`INSERT INTO ${table} SET ?`, [data]);
    const [newData] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
    res.status(201).json({ message: 'Data berhasil ditambahkan', data: newData[0] });
  } catch (err) {
    console.error(`Error create ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.update = (table) => async (req, res) => {
  try {
    const id = req.params.id;
    const [existing] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const data = { ...req.body };
    // Hapus updated_at dari payload jika tabel tidak punya kolom itu
    if (NO_UPDATED_AT.includes(table)) {
      delete data.updated_at;
    } else {
      data.updated_at = new Date();
    }

    await db.query(`UPDATE ${table} SET ? WHERE id = ?`, [data, id]);
    const [updatedData] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    res.json({ message: 'Data berhasil diupdate', data: updatedData[0] });
  } catch (err) {
    console.error(`Error update ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (table) => async (req, res) => {
  try {
    const id = req.params.id;
    const [existing] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ message: 'Data berhasil dihapus', deletedId: id });
  } catch (err) {
    console.error(`Error remove ${table}:`, err.message);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'Data tidak dapat dihapus karena masih digunakan di tabel lain' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
