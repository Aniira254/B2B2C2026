const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const result = await pool.query('SELECT id, email, password_hash, user_type, first_name, last_name, is_active FROM users WHERE email = $1', ['distributor@test.com']);
    console.log('User found:', result.rows[0]);
    
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare('Distributor123!', result.rows[0].password_hash);
    console.log('Password valid:', isValid);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

test();
