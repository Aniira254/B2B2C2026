// Script to initialize database schema on cloud PostgreSQL
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

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to database');
    console.log(`📍 Host: ${process.env.DB_HOST}`);
    console.log(`📊 Database: ${process.env.DB_NAME}\n`);
    
    // Read the schema SQL file
    const schemaSQL = fs.readFileSync('./schema.sql', 'utf8');
    
    console.log('📝 Executing schema creation...');
    await client.query(schemaSQL);
    
    console.log('✅ Database schema created successfully!');
    console.log('\n📋 Tables created:');
    
    // List all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('\n✨ Database initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to initialize database');
    process.exit(1);
  });
