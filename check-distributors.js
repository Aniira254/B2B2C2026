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

async function getDistributors() {
  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.user_type,
        d.company_name,
        d.business_address,
        d.city,
        d.state,
        d.approval_status,
        d.created_at
      FROM users u
      LEFT JOIN distributors d ON u.id = d.user_id
      WHERE u.user_type = 'distributor'
      ORDER BY u.id`
    );
    
    console.log('\n=== DISTRIBUTOR ACCOUNTS IN DATABASE ===\n');
    
    if (result.rows.length === 0) {
      console.log('No distributors found.');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`Distributor #${index + 1}`);
        console.log('-----------------------------------');
        console.log('ID:', row.id);
        console.log('Email:', row.email);
        console.log('Name:', row.first_name, row.last_name);
        console.log('Phone:', row.phone);
        console.log('Company:', row.company_name);
        console.log('Location:', `${row.city}, ${row.state}`);
        console.log('Status:', row.approval_status);
        console.log('Active:', row.is_active);
        console.log('Created:', row.created_at);
        console.log('');
      });
      
      console.log('\n📝 NOTE: Password is hashed in database');
      console.log('✅ Test Login Credentials:');
      console.log('   Email: distributor@test.com');
      console.log('   Password: Distributor123!\n');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

getDistributors();
