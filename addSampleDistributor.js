// Add Sample Distributor Script
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

async function addSampleDistributor() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Sample distributor data
    const email = 'distributor@test.com';
    const password = 'Distributor123!';
    const firstName = 'John';
    const lastName = 'Doe';
    const phone = '+1-555-0123';
    const companyName = 'ABC Distributors Inc.';
    const businessAddress = '456 Commerce Street';
    const city = 'New York';
    const state = 'NY';
    const zipCode = '10001';
    const country = 'USA';

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Creating sample distributor...');
    console.log('Email:', email);
    console.log('Password:', password);

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
        VALUES ($1, $2, 'distributor', $3, $4, $5, true)
        RETURNING id`,
        [email, passwordHash, firstName, lastName, phone]
      );
      
      userId = userResult.rows[0].id;
    }

    // Check if distributor profile exists
    const existingDistributor = await client.query(
      'SELECT id FROM distributors WHERE user_id = $1',
      [userId]
    );

    if (existingDistributor.rows.length > 0) {
      console.log('✓ Updating distributor profile...');
      
      // Update existing distributor profile
      await client.query(
        `UPDATE distributors 
         SET company_name = $1,
             business_address = $2,
             city = $3,
             state = $4,
             zip_code = $5,
             country = $6,
             approval_status = 'approved',
             approved_at = NOW()
         WHERE user_id = $7`,
        [companyName, businessAddress, city, state, zipCode, country, userId]
      );
    } else {
      console.log('✓ Creating distributor profile...');
      
      // Insert distributor profile with approved status
      await client.query(
        `INSERT INTO distributors (
          user_id, company_name, business_address, city, state, zip_code, country, 
          approval_status, approved_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', NOW())`,
        [userId, companyName, businessAddress, city, state, zipCode, country]
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
        d.company_name,
        d.business_address,
        d.city,
        d.state,
        d.approval_status
      FROM users u
      LEFT JOIN distributors d ON u.id = d.user_id
      WHERE u.email = $1`,
      [email]
    );
    
    console.log('\n✓ Sample distributor created successfully!');
    console.log('\n📋 Distributor Details:');
    console.log('-----------------------------------');
    console.log(`ID: ${result.rows[0].id}`);
    console.log(`Email: ${result.rows[0].email}`);
    console.log(`Name: ${result.rows[0].first_name} ${result.rows[0].last_name}`);
    console.log(`Company: ${result.rows[0].company_name}`);
    console.log(`Location: ${result.rows[0].city}, ${result.rows[0].state}`);
    console.log(`Status: ${result.rows[0].approval_status}`);
    console.log(`Active: ${result.rows[0].is_active}`);
    console.log('-----------------------------------');
    console.log('\n🔑 Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\n🌐 Login URL: http://localhost:3000/login\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Error adding sample distributor:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addSampleDistributor()
  .then(() => {
    console.log('\n✓ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
