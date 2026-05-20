const db = require('../configs/db');

// Get all payrolls
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM payroll_details pd WHERE pd.payroll_id = p.id) AS employee_count
      FROM payrolls p
      ORDER BY p.period_year DESC, p.period_month DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error getAll payrolls:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get payroll by id beserta detail karyawan
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT * FROM payrolls WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Payroll tidak ditemukan' });

    const [details] = await db.query(`
      SELECT pd.*, e.code AS employee_code, e.name AS employee_name, e.position
      FROM payroll_details pd
      LEFT JOIN employees e ON pd.employee_id = e.id
      WHERE pd.payroll_id = ?
    `, [id]);

    res.json({ ...rows[0], details });
  } catch (err) {
    console.error('Error getById payroll:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Create payroll — generate otomatis dari semua karyawan aktif
exports.create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { period_month, period_year, details } = req.body;
    if (!period_month || !period_year || !details || details.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Periode dan data karyawan harus diisi' });
    }

    // Cek apakah periode sudah ada
    const [dup] = await conn.query(
      'SELECT id FROM payrolls WHERE period_month = ? AND period_year = ?',
      [period_month, period_year]
    );
    if (dup.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: `Payroll periode ${period_month}/${period_year} sudah ada` });
    }

    // Hitung total
    let total_amount = 0;
    for (const d of details) {
      total_amount += Number(d.base_salary) + Number(d.commission || 0);
    }

    // Insert payroll header
    const [result] = await conn.query(
      'INSERT INTO payrolls (period_month, period_year, total_amount, created_at) VALUES (?, ?, ?, NOW())',
      [period_month, period_year, total_amount]
    );
    const payroll_id = result.insertId;

    // Insert detail per karyawan
    for (const d of details) {
      const total_salary = Number(d.base_salary) + Number(d.commission || 0);
      await conn.query(
        'INSERT INTO payroll_details (payroll_id, employee_id, base_salary, commission, total_salary) VALUES (?, ?, ?, ?, ?)',
        [payroll_id, d.employee_id, d.base_salary, d.commission || 0, total_salary]
      );
    }

    await conn.commit();
    conn.release();

    const [newData] = await db.query('SELECT * FROM payrolls WHERE id = ?', [payroll_id]);
    res.status(201).json({ message: 'Payroll berhasil dibuat', data: newData[0] });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Error create payroll:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete payroll
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const [existing] = await db.query('SELECT * FROM payrolls WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Payroll tidak ditemukan' });

    await db.query('DELETE FROM payrolls WHERE id = ?', [id]);
    res.json({ message: 'Payroll berhasil dihapus', deletedId: id });
  } catch (err) {
    console.error('Error delete payroll:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get semua karyawan dengan gaji pokok (untuk generate form payroll)
exports.getEmployeesForPayroll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, code, name, position, base_salary FROM employees ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
