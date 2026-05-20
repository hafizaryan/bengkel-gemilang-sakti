const db = require('../configs/db');

// Get all spareparts dengan info supplier
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, sup.name as supplier_name 
      FROM spareparts s 
      LEFT JOIN suppliers sup ON s.supplier_id = sup.id 
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error getting spareparts:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get sparepart by id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, sup.name as supplier_name 
      FROM spareparts s 
      LEFT JOIN suppliers sup ON s.supplier_id = sup.id 
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Sparepart tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting sparepart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create sparepart
exports.create = async (req, res) => {
  try {
    const { code, name, supplier_id, buy_price, sell_price, stock } = req.body;
    
    // Validasi
    if (!code || !name || !supplier_id || !buy_price || !sell_price) {
      return res.status(400).json({ 
        error: 'Kode, nama, supplier, harga beli, dan harga jual harus diisi' 
      });
    }
    
    // Cek apakah kode sudah ada
    const [existing] = await db.query('SELECT id FROM spareparts WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Kode sparepart sudah digunakan' });
    }
    
    const data = {
      code,
      name,
      supplier_id,
      buy_price,
      sell_price,
      stock: stock || 0,
      created_at: new Date()
    };
    
    const [result] = await db.query('INSERT INTO spareparts SET ?', [data]);
    
    // Ambil data yang baru dibuat
    const [newData] = await db.query(`
      SELECT s.*, sup.name as supplier_name 
      FROM spareparts s 
      LEFT JOIN suppliers sup ON s.supplier_id = sup.id 
      WHERE s.id = ?
    `, [result.insertId]);
    
    res.status(201).json({ 
      message: 'Sparepart berhasil ditambahkan',
      data: newData[0]
    });
  } catch (err) {
    console.error('Error creating sparepart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update sparepart
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { code, name, supplier_id, buy_price, sell_price, stock } = req.body;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM spareparts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Sparepart tidak ditemukan' });
    }
    
    // Cek apakah kode sudah digunakan oleh sparepart lain
    if (code && code !== existing[0].code) {
      const [duplicate] = await db.query('SELECT id FROM spareparts WHERE code = ? AND id != ?', [code, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ error: 'Kode sparepart sudah digunakan' });
      }
    }
    
    const data = {
      code: code || existing[0].code,
      name: name || existing[0].name,
      supplier_id: supplier_id || existing[0].supplier_id,
      buy_price: buy_price !== undefined ? buy_price : existing[0].buy_price,
      sell_price: sell_price !== undefined ? sell_price : existing[0].sell_price,
      stock: stock !== undefined ? stock : existing[0].stock,
      updated_at: new Date()
    };
    
    await db.query('UPDATE spareparts SET ? WHERE id = ?', [data, id]);
    
    // Ambil data yang sudah diupdate
    const [updatedData] = await db.query(`
      SELECT s.*, sup.name as supplier_name 
      FROM spareparts s 
      LEFT JOIN suppliers sup ON s.supplier_id = sup.id 
      WHERE s.id = ?
    `, [id]);
    
    res.json({ 
      message: 'Sparepart berhasil diupdate',
      data: updatedData[0]
    });
  } catch (err) {
    console.error('Error updating sparepart:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete sparepart
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM spareparts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Sparepart tidak ditemukan' });
    }
    
    await db.query('DELETE FROM spareparts WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Sparepart berhasil dihapus',
      deletedId: id
    });
  } catch (err) {
    console.error('Error deleting sparepart:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ 
        error: 'Sparepart tidak dapat dihapus karena masih digunakan dalam transaksi' 
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
