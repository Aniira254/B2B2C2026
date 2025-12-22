// Test login functionality
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  try {
    const email = 'distributor@test.com';
    const password = 'Distributor123!';
    
    console.log('🔍 Testing login for:', email);
    
    // Step 1: Find user
    const userResult = await pool.query(
      'SELECT id, email, password_hash, user_type, first_name, last_name, is_active FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✓ User found:', {
      id: user.id,
      email: user.email,
      userType: user.user_type,
      isActive: user.is_active,
      hasPasswordHash: !!user.password_hash
    });
    
    // Step 2: Check if active
    if (!user.is_active) {
      console.log('❌ Account is not active');
      return;
    }
    console.log('✓ Account is active');
    
    // Step 3: Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('✓ Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('❌ Password is invalid');
      return;
    }
    
    console.log('\n✅ Login should succeed!');
    console.log('User object that would be used for token generation:', {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      first_name: user.first_name,
      last_name: user.last_name
    });
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testLogin();
