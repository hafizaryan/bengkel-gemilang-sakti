const db = require('./src/configs/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✓ Database connection successful!');
    console.log('Test query result:', rows[0].result);
    
    // Test tables
    console.log('\nChecking tables...');
    const [tables] = await db.query('SHOW TABLES');
    console.log('Available tables:', tables.length);
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Database connection failed!');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testConnection();
