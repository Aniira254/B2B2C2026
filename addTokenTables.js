// Script to add token tables to database
const fs = require('fs');
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

async function addTokenTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to database');
    
    // Read the token schema SQL file
    const tokenSQL = fs.readFileSync('./schema_tokens.sql', 'utf8');
    
    console.log('📝 Creating token tables...');
    await client.query(tokenSQL);
    
    console.log('✅ Token tables created successfully!');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('refresh_tokens', 'password_reset_tokens', 'audit_logs')
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Token tables created:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating token tables:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist, continuing...');
    } else {
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

addTokenTables()
  .then(() => {
    console.log('\n✨ Token tables setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to setup token tables');
    process.exit(1);
  });
