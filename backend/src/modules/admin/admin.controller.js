const { pool } = require('../../config/db');

// 1. Admin Dashboard Metrics (SRS Section 7.1)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Metric cards
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM agents) AS total_agents,
        (SELECT COUNT(*) FROM agents WHERE verification_status = 'verified') AS verified_agents,
        (SELECT COUNT(*) FROM agents WHERE verification_status = 'pending') AS pending_agents,
        (SELECT COUNT(*) FROM properties) AS total_properties,
        (SELECT COUNT(*) FROM properties WHERE approval_status = 'pending') AS pending_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'published') AS published_properties,
        (SELECT COUNT(*) FROM properties WHERE status IN ('sold', 'rented')) AS sold_rented_properties,
        (SELECT COUNT(*) FROM properties WHERE is_featured = true) AS featured_properties,
        (SELECT COUNT(*) FROM property_enquiries) AS total_enquiries,
        (SELECT COUNT(*) FROM property_enquiries WHERE status = 'new') AS new_enquiries
    `);

    // Properties by Type
    const typeDistribution = await pool.query(`
      SELECT pt.name, pt.slug, COUNT(p.id) AS count
      FROM property_types pt
      LEFT JOIN properties p ON p.property_type_id = pt.id
      GROUP BY pt.id, pt.name, pt.slug
      ORDER BY count DESC
    `);

    // Properties by City
    const cityDistribution = await pool.query(`
      SELECT city, COUNT(id) AS count
      FROM properties
      GROUP BY city
      ORDER BY count DESC
      LIMIT 8
    `);

    // Properties by Listing Type
    const listingTypeDistribution = await pool.query(`
      SELECT listing_type, COUNT(id) AS count
      FROM properties
      GROUP BY listing_type
    `);

    // Recent 10 Properties Submitted
    const pendingReviewList = await pool.query(`
      SELECT p.*, pt.name AS property_type_name, u.name AS agent_name, a.agency_name,
        (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image
      FROM properties p
      JOIN property_types pt ON pt.id = p.property_type_id
      JOIN agents a ON a.id = p.agent_id
      JOIN users u ON u.id = a.user_id
      WHERE p.approval_status = 'pending'
      ORDER BY p.created_at DESC
      LIMIT 6
    `);

    // Recent System Activity
    const recentActivity = await pool.query(`
      SELECT psh.*, p.title AS property_title, u.name AS user_name
      FROM property_status_history psh
      JOIN properties p ON p.id = psh.property_id
      LEFT JOIN users u ON u.id = psh.changed_by
      ORDER BY psh.created_at DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      stats: statsRes.rows[0],
      charts: {
        byType: typeDistribution.rows,
        byCity: cityDistribution.rows,
        byListingType: listingTypeDistribution.rows
      },
      pendingReviews: pendingReviewList.rows,
      recentActivity: recentActivity.rows
    });
  } catch (err) {
    next(err);
  }
};

// 2. User Management (SRS Section 7.3)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereSql = 'WHERE 1=1';
    const params = [];
    let pIdx = 1;

    if (role && role !== 'all') {
      whereSql += ` AND u.role = $${pIdx}`;
      params.push(role);
      pIdx++;
    }

    if (search && search.trim()) {
      whereSql += ` AND (u.name ILIKE $${pIdx} OR u.email ILIKE $${pIdx} OR u.phone ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM users u ${whereSql}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const sql = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
             a.id AS agent_id, a.agency_name, a.verification_status,
             (SELECT COUNT(*) FROM properties WHERE agent_id = a.id) AS property_count,
             (SELECT COUNT(*) FROM property_enquiries WHERE customer_id = u.id) AS enquiry_count
      FROM users u
      LEFT JOIN agents a ON a.user_id = u.id
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT $${pIdx} OFFSET $${pIdx + 1}
    `;
    params.push(parseInt(limit, 10), offset);

    const result = await pool.query(sql, params);

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// 3. Toggle User Active Status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, is_active`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({
      success: true,
      message: `User ${result.rows[0].name} has been ${result.rows[0].is_active ? 'activated' : 'deactivated'}.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
