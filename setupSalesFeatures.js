const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupSalesFeatures() {
  try {
    console.log('Setting up sales representative dashboard features...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'schema_sales_features.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log('✅ Sales reports table created');
    console.log('✅ Sales tasks table created');
    console.log('✅ Conversations table created');
    console.log('✅ Messages table created');
    console.log('✅ Indexes created');
    console.log('✅ Triggers created');

    console.log('\n🎉 Sales representative dashboard features setup complete!');
    console.log('\nNew features available:');
    console.log('  📄 Report Submission System');
    console.log('  ✅ Task Management');
    console.log('  💬 Internal Messaging');
    console.log('\nAll existing features are still available:');
    console.log('  🏖️ Leave Management');
    console.log('  📢 Announcements');
    console.log('  💡 Suggestion Box');
    console.log('  📊 Performance Metrics');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up sales features:', error);
    process.exit(1);
  }
}

setupSalesFeatures();
