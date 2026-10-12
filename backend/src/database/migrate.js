const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
  console.log('--- Running PostgreSQL Database Migrations ---');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await pool.query(sql);

    // Verify created tables
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('✅ Migration completed successfully!');
    console.log('Existing tables in realestate_db:');
    res.rows.forEach((row, i) => console.log(`  ${i + 1}. ${row.table_name}`));
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
