const { pool } = require('../config/db');

async function createCustomerFeedbackTable() {
  try {
    console.log('--- Creating customer_feedback table ---');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_feedback (
        id SERIAL PRIMARY KEY,
        agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        customer_phone VARCHAR(50),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        category VARCHAR(100) DEFAULT 'Overall Experience',
        feedback_title VARCHAR(255),
        comment TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        agent_reply TEXT,
        agent_replied_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_customer_feedback_agent ON customer_feedback(agent_id);
      CREATE INDEX IF NOT EXISTS idx_customer_feedback_property ON customer_feedback(property_id);
      CREATE INDEX IF NOT EXISTS idx_customer_feedback_created ON customer_feedback(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_customer_feedback_approved ON customer_feedback(is_approved);
    `);

    console.log('✅ customer_feedback table and indexes created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

createCustomerFeedbackTable();
