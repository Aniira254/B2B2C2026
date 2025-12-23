const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSalesReps() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.user_type,
        sr.employee_id,
        sr.department,
        sr.territory,
        sr.hire_date
      FROM users u
      LEFT JOIN sales_representatives sr ON u.id = sr.user_id
      WHERE u.user_type = 'sales_representative'
      ORDER BY u.id
    `);

    console.log('\n=== SALES REPRESENTATIVE ACCOUNTS ===\n');
    
    if (result.rows.length === 0) {
      console.log('No sales reps found.');
    } else {
      result.rows.forEach((row, idx) => {
        console.log(`Sales Rep #${idx + 1}`);
        console.log('-----------------------------------');
        console.log('User ID:', row.id);
        console.log('Email:', row.email);
        console.log('Name:', row.first_name, row.last_name);
        console.log('Phone:', row.phone || 'Not set');
        console.log('Employee ID:', row.employee_id);
        console.log('Department:', row.department);
        console.log('Territory:', row.territory);
        console.log('Hire Date:', row.hire_date);
        console.log('Active:', row.is_active);
        console.log('');
      });
      
      console.log('\n📝 NOTE: Password is hashed in database');
      console.log('✅ Test Login Credentials:');
      console.log('   Email: salesrep@test.com');
      console.log('   Password: SalesRep123!\n');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkSalesReps();
