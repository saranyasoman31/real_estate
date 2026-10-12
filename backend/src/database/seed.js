const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('--- Seeding Clean Database for Single-Client Real Estate Platform ---');
  try {
    // 1. Clear all dummy data
    console.log('Wiping existing dummy properties, inquiries, and users...');
    await pool.query('DELETE FROM favorites;');
    await pool.query('DELETE FROM property_enquiries;');
    await pool.query('DELETE FROM property_amenities;');
    await pool.query('DELETE FROM property_images;');
    await pool.query('DELETE FROM properties;');
    await pool.query('DELETE FROM notifications;');
    await pool.query('DELETE FROM agent_documents;');
    await pool.query('DELETE FROM agents;');
    await pool.query('DELETE FROM users;');
    await pool.query('DELETE FROM localities;');
    await pool.query('DELETE FROM cities;');

    // 2. Roles
    await pool.query(`
      INSERT INTO roles (name, description) VALUES
      ('customer', 'Customer discovering properties and contacting client'),
      ('client', 'Real estate agency owner / administrator managing inventory and leads')
      ON CONFLICT (name) DO NOTHING;
    `);

    // 3. Create Default Agent / Client User
    // Email/Username: darvproperties.com, Password: 123456
    const passwordHash = await bcrypt.hash('123456', 10);
    const userRes = await pool.query(`
      INSERT INTO users (name, email, password_hash, phone, role, avatar_url, is_active)
      VALUES (
        'Saranya Soman',
        'darvproperties.com',
        $1,
        '+91 6282649279',
        'client',
        '/images/darv-icon.png',
        true
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, name, email, role;
    `, [passwordHash]);

    const agentUser = userRes.rows[0];
    console.log(`✅ Created Default Agent User: ${agentUser.name} (${agentUser.email})`);

    // 4. Create Agent Profile for Saranya Soman
    await pool.query(`
      INSERT INTO agents (
        user_id, agency_name, license_number, phone, whatsapp,
        bio, office_address, operating_cities, experience_years,
        verification_status, rating, total_sales
      ) VALUES (
        $1,
        'DARV Real Estate & Construction',
        'K-RERA/PRJ/TVM/2026',
        '+91 98470 12345',
        '+919847012345',
        'Certified real estate property consultant specializing in premium residences, flats, and prime plots in Trivandrum.',
        'Trivandrum, Kerala',
        'Trivandrum',
        6,
        'verified',
        5.00,
        0
      )
      ON CONFLICT (user_id) DO UPDATE SET
        agency_name = EXCLUDED.agency_name,
        operating_cities = EXCLUDED.operating_cities,
        verification_status = 'verified',
        updated_at = CURRENT_TIMESTAMP;
    `, [agentUser.id]);

    // 5. Property Types Master Data
    await pool.query(`
      INSERT INTO property_types (name, slug, icon, description) VALUES
      ('Apartment / Flat', 'apartment', 'Building2', 'High-rise residential apartments, studios, and penthouses'),
      ('Luxury Villa', 'villa', 'Home', 'Standalone private villas with gardens, gated luxury compounds'),
      ('Independent House', 'house', 'Warehouse', 'Stand-alone builder floors and independent bungalows'),
      ('Plot / Land', 'plot', 'Landmark', 'Approved residential, agricultural, and commercial layout plots'),
      ('Commercial Space', 'commercial', 'Briefcase', 'Office spaces, retail shops, tech park floors, and showrooms')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
    `);

    // 6. State & City (Trivandrum Only)
    const klState = await pool.query(`
      INSERT INTO states (name, code) VALUES ('Kerala', 'KL')
      ON CONFLICT (name) DO UPDATE SET code = 'KL'
      RETURNING id;
    `);
    const klId = klState.rows[0].id;

    await pool.query(`
      INSERT INTO cities (state_id, name, image_url, is_popular) VALUES
      ($1, 'Trivandrum', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80', true)
      ON CONFLICT (state_id, name) DO NOTHING;
    `, [klId]);

    // 7. Amenities Master Data
    await pool.query(`
      INSERT INTO amenities (name, category, icon) VALUES
      ('Swimming Pool', 'leisure', 'Waves'),
      ('Gymnasium & Fitness Center', 'wellness', 'Dumbbell'),
      ('24/7 Security & CCTV', 'security', 'ShieldCheck'),
      ('Power Backup (100%)', 'utility', 'Zap'),
      ('Clubhouse & Party Hall', 'community', 'Users'),
      ('Covered Reserved Parking', 'parking', 'Car'),
      ('Children Play Area', 'leisure', 'Smile'),
      ('Landscaped Zen Gardens', 'outdoors', 'Trees'),
      ('High-Speed Elevators', 'convenience', 'ArrowUpDown'),
      ('EV Charging Stations', 'eco', 'BatteryCharging'),
      ('Piped Gas Connection', 'utility', 'Flame'),
      ('Rainwater Harvesting', 'eco', 'Droplets')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Database cleanly seeded with zero dummy properties.');
    console.log('--- Default Agent Login Credentials ---');
    console.log('Username / Email: darvproperties.com');
    console.log('Password:         123456');
    console.log('Portal Route:     /admin');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
