const { pool } = require('../config/db');

async function migrateProfileAndEmailColumns() {
  console.log('--- Migrating Database for Agent Profile & Email Push ---');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add columns to agents table
    await client.query(`
      ALTER TABLE agents 
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS email VARCHAR(150);
    `);
    console.log('✓ Checked/added website, logo_url, email to agents table');

    // 2. Add columns to property_enquiries table
    await client.query(`
      ALTER TABLE property_enquiries
      ADD COLUMN IF NOT EXISTS last_email_push_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS email_push_count INTEGER DEFAULT 0;
    `);
    console.log('✓ Checked/added last_email_push_at, email_push_count to property_enquiries table');

    // 3. Create enquiry_email_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiry_email_logs (
        id SERIAL PRIMARY KEY,
        enquiry_id INTEGER NOT NULL REFERENCES property_enquiries(id) ON DELETE CASCADE,
        recipient_email VARCHAR(150) NOT NULL,
        sender_email VARCHAR(150) NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'sent',
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Checked/created enquiry_email_logs table');

    // 4. Update existing default agent record with initial values
    await client.query(`
      UPDATE agents a
      SET 
        logo_url = COALESCE(a.logo_url, u.avatar_url, '/images/darv-icon.png'),
        email = COALESCE(a.email, u.email, 'saranyasoman31@gmail.com'),
        website = COALESCE(a.website, 'https://apexrealty-trivandrum.com'),
        office_address = COALESCE(a.office_address, 'Apex Realty Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003'),
        phone = COALESCE(a.phone, '+91 98470 12345'),
        whatsapp = COALESCE(a.whatsapp, '+919847012345')
      FROM users u
      WHERE a.user_id = u.id AND u.email = 'saranyasoman31@gmail.com';
    `);
    console.log('✓ Initialized default agent fields for saranyasoman31@gmail.com');

    await client.query('COMMIT');
    console.log('--- Migration completed successfully ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrateProfileAndEmailColumns().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrateProfileAndEmailColumns;
