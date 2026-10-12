const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const { JWT_SECRET } = require('../../middleware/auth');

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// Customer Registration (Agents do not register; single client owner only)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Register strictly as customer
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role, avatar_url, is_active)
       VALUES ($1, $2, $3, $4, 'customer', $5, true)
       RETURNING id, name, email, phone, role, avatar_url, created_at`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        phone || '',
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      ]
    );

    const user = newUser.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

// Login user (Client Owner or Customer)
exports.login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password.' });
    }

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.phone, u.role, u.avatar_url, u.is_active,
              a.id AS agent_id, a.agency_name, a.license_number, a.verification_status, a.phone AS agency_phone, a.whatsapp AS agency_whatsapp
       FROM users u
       LEFT JOIN agents a ON a.user_id = u.id
       WHERE LOWER(u.email) = $1
          OR (u.email = 'darvproperties.com' AND $1 IN ('darvproperties.com', 'saranyasoman31@gmail.com', 'admin@darvproperties.com'))
          OR (u.email = 'saranyasoman31@gmail.com' AND $1 IN ('darvproperties.com', 'saranyasoman31@gmail.com'))
       ORDER BY (u.role IN ('agent', 'client', 'admin')) DESC
       LIMIT 1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

// Get current authenticated user
exports.getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar_url, u.created_at,
              a.id AS agent_id, a.agency_name, a.license_number, a.bio, a.office_address,
              a.operating_cities, a.experience_years, a.rating, a.total_sales,
              a.phone AS agency_phone, a.whatsapp AS agency_whatsapp
       FROM users u
       LEFT JOIN agents a ON a.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar_url, agency_name, license_number, bio, office_address, operating_cities, whatsapp } = req.body;
    
    const userRes = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, phone, role, avatar_url, updated_at`,
      [name, phone, avatar_url, req.user.id]
    );

    // If client owner, also update agency info
    if (['client', 'admin'].includes(req.user.role)) {
      await pool.query(
        `UPDATE agents
         SET agency_name = COALESCE($1, agency_name),
             license_number = COALESCE($2, license_number),
             bio = COALESCE($3, bio),
             office_address = COALESCE($4, office_address),
             operating_cities = COALESCE($5, operating_cities),
             whatsapp = COALESCE($6, whatsapp),
             phone = COALESCE($7, phone),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $8`,
        [agency_name, license_number, bio, office_address, operating_cities, whatsapp, phone, req.user.id]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: userRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
