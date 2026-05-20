const db = require('../configs/db');

// Get all suppliers
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error getting suppliers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get supplier by id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Supplier tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting supplier:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create supplier
exports.create = async (req, res) => {
  try {
    const { code, name, address, phone } = req.body;
    
    // Validasi
    if (!code || !name) {
      return res.status(400).json({ error: 'Kode dan nama supplier harus diisi' });
    }
    
    // Cek apakah kode sudah ada
    const [existing] = await db.query('SELECT id FROM suppliers WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Kode supplier sudah digunakan' });
    }
    
    const data = {
      code,
      name,
      address: address || null,
      phone: phone || null,
      created_at: new Date()
    };
    
    const [result] = await db.query('INSERT INTO suppliers SET ?', [data]);
    const [newData] = await db.query('SELECT * FROM suppliers WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: 'Supplier berhasil ditambahkan',
      data: newData[0]
    });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update supplier
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { code, name, address, phone } = req.body;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Supplier tidak ditemukan' });
    }
    
    // Cek apakah kode sudah digunakan oleh supplier lain
    if (code && code !== existing[0].code) {
      const [duplicate] = await db.query('SELECT id FROM suppliers WHERE code = ? AND id != ?', [code, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ error: 'Kode supplier sudah digunakan' });
      }
    }
    
    const data = {
      code: code || existing[0].code,
      name: name || existing[0].name,
      address: address !== undefined ? address : existing[0].address,
      phone: phone !== undefined ? phone : existing[0].phone,
      updated_at: new Date()
    };
    
    await db.query('UPDATE suppliers SET ? WHERE id = ?', [data, id]);
    const [updatedData] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Supplier berhasil diupdate',
      data: updatedData[0]
    });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete supplier
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Supplier tidak ditemukan' });
    }
    
    await db.query('DELETE FROM suppliers WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Supplier berhasil dihapus',
      deletedId: id
    });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ 
        error: 'Supplier tidak dapat dihapus karena masih memiliki sparepart' 
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
