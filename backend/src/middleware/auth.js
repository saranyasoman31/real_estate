const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'real_estate_secure_jwt_token_secret_key_2026';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userQuery = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar_url, u.is_active,
              a.id AS agent_id, a.verification_status, a.agency_name
       FROM users u
       LEFT JOIN agents a ON a.user_id = u.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid.' });
    }

    const user = userQuery.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const userQuery = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar_url,
                a.id AS agent_id, a.verification_status
         FROM users u
         LEFT JOIN agents a ON a.user_id = u.id
         WHERE u.id = $1`,
        [decoded.userId]
      );
      if (userQuery.rows.length > 0) {
        req.user = userQuery.rows[0];
      }
    }
  } catch (e) {
    // Silent ignore for optional authentication
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not allowed to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  JWT_SECRET
};
