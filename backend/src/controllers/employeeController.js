const db = require('../configs/db');

// Get all employees
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error getting employees:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get employee by id
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error getting employee:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create employee
exports.create = async (req, res) => {
  try {
    const { code, name, position, base_salary } = req.body;
    
    // Validasi
    if (!code || !name || !position || !base_salary) {
      return res.status(400).json({ 
        error: 'Kode, nama, posisi, dan gaji pokok harus diisi' 
      });
    }
    
    // Cek apakah kode sudah ada
    const [existing] = await db.query('SELECT id FROM employees WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Kode karyawan sudah digunakan' });
    }
    
    const data = {
      code,
      name,
      position,
      base_salary,
      created_at: new Date()
    };
    
    const [result] = await db.query('INSERT INTO employees SET ?', [data]);
    const [newData] = await db.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: 'Karyawan berhasil ditambahkan',
      data: newData[0]
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update employee
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { code, name, position, base_salary } = req.body;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    // Cek apakah kode sudah digunakan oleh karyawan lain
    if (code && code !== existing[0].code) {
      const [duplicate] = await db.query('SELECT id FROM employees WHERE code = ? AND id != ?', [code, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ error: 'Kode karyawan sudah digunakan' });
      }
    }
    
    const data = {
      code: code || existing[0].code,
      name: name || existing[0].name,
      position: position || existing[0].position,
      base_salary: base_salary !== undefined ? base_salary : existing[0].base_salary,
      updated_at: new Date()
    };
    
    await db.query('UPDATE employees SET ? WHERE id = ?', [data, id]);
    const [updatedData] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Karyawan berhasil diupdate',
      data: updatedData[0]
    });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete employee
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Cek apakah data ada
    const [existing] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
    }
    
    await db.query('DELETE FROM employees WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Karyawan berhasil dihapus',
      deletedId: id
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ 
        error: 'Karyawan tidak dapat dihapus karena masih terkait dengan service atau payroll' 
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};
