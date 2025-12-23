// Script to add a sample sales representative to the database
const bcrypt = require('bcryptjs');
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

async function addSampleSalesRep() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Sample sales rep data
    const email = 'salesrep@test.com';
    const password = 'SalesRep123!';
    const firstName = 'Jane';
    const lastName = 'Smith';
    const phone = '+1-555-0456';
    const employeeId = 'SR001';
    const department = 'Sales';
    const territory = 'North Region';
    const hireDate = '2024-01-15';

    console.log('Creating sample sales representative...');
    console.log('Email:', email);
    console.log('Password:', password);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    let userId;

    if (existingUser.rows.length > 0) {
      console.log('⚠ User already exists, updating password...');
      userId = existingUser.rows[0].id;
      
      // Update existing user password
      await client.query(
        `UPDATE users 
         SET password_hash = $1,
             is_active = true
         WHERE id = $2`,
        [passwordHash, userId]
      );
    } else {
      console.log('✓ Creating new user...');
      
      // Insert new user
      const userResult = await client.query(
        `INSERT INTO users (
          email, password_hash, user_type, first_name, last_name, phone, is_active
        )
        VALUES ($1, $2, 'sales_representative', $3, $4, $5, true)
        RETURNING id`,
        [email, passwordHash, firstName, lastName, phone]
      );
      
      userId = userResult.rows[0].id;
    }

    // Check if sales rep profile exists
    const existingSalesRep = await client.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (existingSalesRep.rows.length > 0) {
      console.log('✓ Updating sales rep profile...');
      
      // Update existing sales rep profile
      await client.query(
        `UPDATE sales_representatives 
         SET employee_id = $1,
             department = $2,
             territory = $3,
             hire_date = $4
         WHERE user_id = $5`,
        [employeeId, department, territory, hireDate, userId]
      );
    } else {
      console.log('✓ Creating sales rep profile...');
      
      // Insert sales rep profile
      await client.query(
        `INSERT INTO sales_representatives (
          user_id, employee_id, department, territory, hire_date
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [userId, employeeId, department, territory, hireDate]
      );
    }

    await client.query('COMMIT');

    // Verify the data
    const result = await client.query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type,
        u.is_active,
        sr.employee_id,
        sr.department,
        sr.territory,
        sr.hire_date
      FROM users u
      LEFT JOIN sales_representatives sr ON u.id = sr.user_id
      WHERE u.email = $1`,
      [email]
    );
    
    console.log('\n✓ Sample sales rep created successfully!');
    console.log('\n📋 Sales Rep Details:');
    console.log('-----------------------------------');
    console.log(`ID: ${result.rows[0].id}`);
    console.log(`Email: ${result.rows[0].email}`);
    console.log(`Name: ${result.rows[0].first_name} ${result.rows[0].last_name}`);
    console.log(`Employee ID: ${result.rows[0].employee_id}`);
    console.log(`Department: ${result.rows[0].department}`);
    console.log(`Territory: ${result.rows[0].territory}`);
    console.log(`Active: ${result.rows[0].is_active}`);
    console.log('-----------------------------------');
    console.log('\n🔑 Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n🌐 Login URL: http://localhost:3000/login\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error adding sample sales rep:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addSampleSalesRep()
  .then(() => {
    console.log('✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Script failed:', error);
    process.exit(1);
  });
