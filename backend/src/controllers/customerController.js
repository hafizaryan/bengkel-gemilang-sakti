const db = require('../configs/db');

// Get all customers
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error getting customers:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get customer by id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting customer:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create customer
exports.create = async (req, res) => {
  try {
    const { code, name, phone, address } = req.body;
    
    // Validasi
    if (!code || !name) {
      return res.status(400).json({ error: 'Kode dan nama customer harus diisi' });
    }
    
    // Cek apakah kode sudah ada
    const [existing] = await db.query('SELECT id FROM customers WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Kode customer sudah digunakan' });
    }
    
    const data = {
      code,
      name,
      phone: phone || null,
      address: address || null,
      created_at: new Date()
    };
    
    const [result] = await db.query('INSERT INTO customers SET ?', [data]);
    const [newData] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: 'Customer berhasil ditambahkan',
      data: newData[0]
    });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update customer
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { code, name, phone, address } = req.body;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }
    
    // Cek apakah kode sudah digunakan oleh customer lain
    if (code && code !== existing[0].code) {
      const [duplicate] = await db.query('SELECT id FROM customers WHERE code = ? AND id != ?', [code, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ error: 'Kode customer sudah digunakan' });
      }
    }
    
    const data = {
      code: code || existing[0].code,
      name: name || existing[0].name,
      phone: phone !== undefined ? phone : existing[0].phone,
      address: address !== undefined ? address : existing[0].address,
      updated_at: new Date()
    };
    
    await db.query('UPDATE customers SET ? WHERE id = ?', [data, id]);
    const [updatedData] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Customer berhasil diupdate',
      data: updatedData[0]
    });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete customer
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }
    
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Customer berhasil dihapus',
      deletedId: id
    });
  } catch (err) {
    console.error('Error deleting customer:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ 
        error: 'Customer tidak dapat dihapus karena masih memiliki motor atau transaksi' 
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
