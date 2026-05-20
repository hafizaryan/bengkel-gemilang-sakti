const fs = require('fs');
const path = require('path');

const files = {
  'configs/db.js': `
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bengkel_gemilang',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
`,
  'middlewares/auth.js': `
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }
  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};
`,
  'controllers/authController.js': `
const db = require('../configs/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(404).send({ message: 'User not found.' });
    
    const user = rows[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send({ message: 'Invalid Password!' });
    
    const token = jwt.sign({ id: user.id, role: user.role_name }, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: 86400 // 24 hours
    });
    
    res.status(200).send({
      id: user.id,
      username: user.username,
      role: user.role_name,
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
`,
  'controllers/crudController.js': `
const db = require('../configs/db');

exports.getAll = (table) => async (req, res) => {
  try {
    const [rows] = await db.query(\`SELECT * FROM \${table} ORDER BY created_at DESC\`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = (table) => async (req, res) => {
  try {
    const [rows] = await db.query(\`SELECT * FROM \${table} WHERE id = ?\`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (table) => async (req, res) => {
  try {
    const data = req.body;
    const [result] = await db.query(\`INSERT INTO \${table} SET ?\`, [data]);
    res.status(201).json({ id: result.insertId, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (table) => async (req, res) => {
  try {
    const data = req.body;
    const [result] = await db.query(\`UPDATE \${table} SET ? WHERE id = ?\`, [data, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ id: req.params.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (table) => async (req, res) => {
  try {
    const [result] = await db.query(\`DELETE FROM \${table} WHERE id = ?\`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
`,
  'routes/index.js': `
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const crudController = require('../controllers/crudController');
const { verifyToken } = require('../middlewares/auth');

router.post('/auth/login', authController.login);

const tables = ['spareparts', 'suppliers', 'customers', 'employees', 'services', 'motorcycles'];
tables.forEach(table => {
  router.get(\`/\${table}\`, verifyToken, crudController.getAll(table));
  router.get(\`/\${table}/:id\`, verifyToken, crudController.getById(table));
  router.post(\`/\${table}\`, verifyToken, crudController.create(table));
  router.put(\`/\${table}/:id\`, verifyToken, crudController.update(table));
  router.delete(\`/\${table}/:id\`, verifyToken, crudController.remove(table));
});

module.exports = router;
`,
  'app.js': `
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Bengkel Gemilang API.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}.\`);
});
`,
  '../.env': `
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bengkel_gemilang
JWT_SECRET=bengkel_secret_key_2026
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
}
console.log('Backend files generated successfully.');
