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