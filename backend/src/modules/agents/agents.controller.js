const { pool } = require('../../config/db');

// 1. PUBLIC: List verified agents
exports.getPublicAgents = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let sql = `
      SELECT 
        a.id, a.agency_name, a.license_number, a.bio, a.operating_cities,
        a.experience_years, a.rating, a.total_sales, a.verification_status,
        u.name, u.email, u.phone, u.avatar_url,
        (SELECT COUNT(*) FROM properties WHERE agent_id = a.id AND status = 'published') AS active_listings_count
      FROM agents a
      JOIN users u ON u.id = a.user_id
      WHERE a.verification_status = 'verified' AND u.is_active = true
    `;
    const params = [];
    let pIdx = 1;

    if (city && city.trim()) {
      sql += ` AND a.operating_cities ILIKE $${pIdx}`;
      params.push(`%${city.trim()}%`);
      pIdx++;
    }

    if (search && search.trim()) {
      sql += ` AND (u.name ILIKE $${pIdx} OR a.agency_name ILIKE $${pIdx} OR a.operating_cities ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    sql += ` ORDER BY a.rating DESC, a.total_sales DESC`;

    const result = await pool.query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 1b. PUBLIC: Get primary agent contact details for the platform
exports.getPrimaryAgentPublic = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.id, a.agency_name, a.license_number, a.bio, 
        COALESCE(a.office_address, 'Trivandrum, Kerala') AS address,
        a.office_address,
        COALESCE(a.operating_cities, 'Trivandrum') AS operating_cities,
        a.experience_years, a.rating, a.total_sales, a.verification_status,
        COALESCE(a.phone, u.phone, '+91 98470 12345') AS phone,
        COALESCE(a.whatsapp, '+919847012345') AS whatsapp,
        COALESCE(a.email, u.email, 'saranyasoman31@gmail.com') AS email,
        COALESCE(a.website, 'https://www.darvproperties.com') AS website,
        COALESCE(a.logo_url, u.avatar_url, '/images/darv-icon.png') AS logo,
        COALESCE(a.logo_url, u.avatar_url, '/images/darv-icon.png') AS logo_url,
        u.name
       FROM agents a
       JOIN users u ON u.id = a.user_id
       WHERE u.is_active = true
       ORDER BY a.id ASC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          name: 'Saranya Soman',
          email: 'saranyasoman31@gmail.com',
          phone: '+91 6282649279',
          whatsapp: '+916282649279',
          website: 'https://www.darvproperties.com',
          address: 'DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003',
          logo: '/images/darv-icon.png',
          agency_name: 'DARV Real Estate & Construction',
          license_number: 'K-RERA/PRJ/TVM/2026'
        }
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// 2. PUBLIC: Get single agent profile & published listings
exports.getAgentPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const agentRes = await pool.query(
      `SELECT 
        a.*,
        u.name, u.email, u.phone, u.avatar_url
       FROM agents a
       JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [id]
    );

    if (agentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agent not found.' });
    }

    const agent = agentRes.rows[0];

    // Fetch published properties
    const propRes = await pool.query(
      `SELECT p.*,
              pt.name AS property_type_name,
              pt.slug AS property_type_slug,
              (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image
       FROM properties p
       JOIN property_types pt ON pt.id = p.property_type_id
       WHERE p.agent_id = $1 AND p.status = 'published'
       ORDER BY p.is_featured DESC, p.created_at DESC`,
      [id]
    );

    agent.properties = propRes.rows;

    res.json({ success: true, data: agent });
  } catch (err) {
    next(err);
  }
};

// 3. AGENT: Dashboard metrics (SRS Section 6.1)
exports.getAgentDashboard = async (req, res, next) => {
  try {
    const agentId = req.user.agent_id;
    if (!agentId) {
      return res.status(403).json({ success: false, message: 'No agent profile attached to this user.' });
    }

    // Listings counts
    const countRes = await pool.query(
      `SELECT 
        COUNT(*) AS total_listings,
        COUNT(*) FILTER (WHERE status = 'published') AS published_listings,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_approval,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft_listings,
        COUNT(*) FILTER (WHERE status = 'sold') AS sold_listings,
        COUNT(*) FILTER (WHERE status = 'rented') AS rented_listings,
        COALESCE(SUM(views_count), 0) AS total_views
       FROM properties
       WHERE agent_id = $1`,
      [agentId]
    );

    // Enquiries counts
    const enquiryRes = await pool.query(
      `SELECT 
        COUNT(*) AS total_enquiries,
        COUNT(*) FILTER (WHERE pe.status = 'new') AS new_enquiries,
        COUNT(*) FILTER (WHERE pe.status = 'contacted') AS contacted_enquiries,
        COUNT(*) FILTER (WHERE pe.status = 'follow_up') AS followup_enquiries
       FROM property_enquiries pe
       JOIN properties p ON p.id = pe.property_id
       WHERE p.agent_id = $1`,
      [agentId]
    );

    // Recent 5 enquiries
    const recentEnquiries = await pool.query(
      `SELECT pe.*, p.title AS property_title, p.ref_number
       FROM property_enquiries pe
       JOIN properties p ON p.id = pe.property_id
       WHERE p.agent_id = $1
       ORDER BY pe.created_at DESC
       LIMIT 5`,
      [agentId]
    );

    // Verification and Profile info
    const profileRes = await pool.query(
      `SELECT a.*, u.name, u.email, u.avatar_url FROM agents a JOIN users u ON u.id = a.user_id WHERE a.id = $1`,
      [agentId]
    );

    res.json({
      success: true,
      stats: {
        ...countRes.rows[0],
        ...enquiryRes.rows[0],
      },
      recentEnquiries: recentEnquiries.rows,
      agent: profileRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 4. AGENT: Get profile
exports.getAgentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let agentResult = await pool.query(
      `SELECT a.*, 
              u.name, 
              COALESCE(a.email, u.email) AS email, 
              COALESCE(a.phone, u.phone) AS phone, 
              u.phone AS user_phone, 
              COALESCE(a.logo_url, u.avatar_url) AS logo,
              COALESCE(a.logo_url, u.avatar_url) AS logo_url,
              u.avatar_url,
              COALESCE(a.office_address, 'Apex Realty Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003') AS address
       FROM users u
       LEFT JOIN agents a ON a.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (agentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    let agentData = agentResult.rows[0];

    // If no agent record yet for this user, create one automatically
    if (!agentData.id) {
      const newAgentRes = await pool.query(
        `INSERT INTO agents (user_id, agency_name, license_number, phone, whatsapp, email, website, office_address, operating_cities, verification_status)
         VALUES ($1, 'Apex Realty & Advisory', 'K-RERA/PRJ/TVM/2026', $2, $2, $3, 'https://apexrealty-trivandrum.com', 'Apex Realty Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003', 'Trivandrum', 'verified')
         RETURNING *`,
        [userId, req.user.phone || '+91 98470 12345', req.user.email]
      );
      agentData = {
        ...agentData,
        ...newAgentRes.rows[0],
        logo: agentData.avatar_url,
        logo_url: agentData.avatar_url,
        address: newAgentRes.rows[0].office_address
      };
    }

    // Documents
    const docs = await pool.query(
      `SELECT * FROM agent_documents WHERE agent_id = $1 ORDER BY uploaded_at DESC`,
      [agentData.id]
    );

    res.json({
      success: true,
      data: {
        ...agentData,
        name: agentData.name,
        logo: agentData.logo_url || agentData.avatar_url,
        address: agentData.office_address,
        documents: docs.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

// 5. AGENT: Update profile (name, logo, phone, whatsapp, email, website, address)
exports.updateAgentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      logo,
      logo_url,
      phone,
      whatsapp,
      email,
      website,
      address,
      office_address,
      agency_name,
      license_number,
      bio,
      operating_cities,
      experience_years
    } = req.body;

    const finalLogo = logo_url || logo;
    const finalAddress = address || office_address;

    // 1. Update users table (name, email, phone, avatar_url)
    const userUpdateSql = `
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        avatar_url = COALESCE($4, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, email, phone, avatar_url, role;
    `;
    const userRes = await pool.query(userUpdateSql, [
      name && name.trim() ? name.trim() : null,
      email && email.trim() ? email.toLowerCase().trim() : null,
      phone && phone.trim() ? phone.trim() : null,
      finalLogo || null,
      userId
    ]);

    // 2. Ensure agent record exists
    let agentCheck = await pool.query(`SELECT id FROM agents WHERE user_id = $1`, [userId]);
    let agentId;
    if (agentCheck.rows.length === 0) {
      const insRes = await pool.query(
        `INSERT INTO agents (user_id, agency_name, license_number, phone, whatsapp, email, website, office_address, operating_cities, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'verified')
         RETURNING id`,
        [
          userId,
          agency_name || 'Apex Realty & Advisory',
          license_number || 'K-RERA/PRJ/TVM/2026',
          phone || '+91 98470 12345',
          whatsapp || '+919847012345',
          email || req.user.email,
          website || 'https://apexrealty-trivandrum.com',
          finalAddress || 'Apex Realty Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003',
          operating_cities || 'Trivandrum'
        ]
      );
      agentId = insRes.rows[0].id;
    } else {
      agentId = agentCheck.rows[0].id;
    }

    // 3. Update agents table
    const agentUpdateSql = `
      UPDATE agents SET
        agency_name = COALESCE($1, agency_name),
        license_number = COALESCE($2, license_number),
        bio = COALESCE($3, bio),
        office_address = COALESCE($4, office_address),
        operating_cities = COALESCE($5, operating_cities),
        experience_years = COALESCE($6, experience_years),
        phone = COALESCE($7, phone),
        whatsapp = COALESCE($8, whatsapp),
        email = COALESCE($9, email),
        website = COALESCE($10, website),
        logo_url = COALESCE($11, logo_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *;
    `;
    const agentRes = await pool.query(agentUpdateSql, [
      agency_name || null,
      license_number || null,
      bio || null,
      finalAddress || null,
      operating_cities || null,
      experience_years ? parseInt(experience_years, 10) : null,
      phone || null,
      whatsapp || null,
      email || null,
      website || null,
      finalLogo || null,
      agentId
    ]);

    const updatedAgent = agentRes.rows[0];
    const updatedUser = userRes.rows[0];

    res.json({
      success: true,
      message: 'Agent profile updated successfully.',
      data: {
        ...updatedAgent,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedAgent.phone || updatedUser.phone,
        whatsapp: updatedAgent.whatsapp,
        website: updatedAgent.website,
        logo: updatedAgent.logo_url || updatedUser.avatar_url,
        logo_url: updatedAgent.logo_url || updatedUser.avatar_url,
        address: updatedAgent.office_address
      }
    });
  } catch (err) {
    next(err);
  }
};

// 5b. AGENT: Upload Profile / Agency Logo
exports.uploadAgentLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo image file uploaded.' });
    }
    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const userId = req.user.id;

    await pool.query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [logoUrl, userId]);
    await pool.query(`UPDATE agents SET logo_url = $1 WHERE user_id = $2`, [logoUrl, userId]);

    res.json({
      success: true,
      message: 'Logo uploaded and updated successfully.',
      logo_url: logoUrl,
      logo: logoUrl
    });
  } catch (err) {
    next(err);
  }
};

// 6. AGENT: Upload KYC Document
exports.uploadAgentDocument = async (req, res, next) => {
  try {
    const agentId = req.user.agent_id;
    const { doc_type, doc_name, doc_url } = req.body;

    let finalUrl = doc_url;
    let finalName = doc_name;

    if (req.file) {
      finalUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      finalName = req.file.originalname;
    }

    if (!finalUrl || !doc_type) {
      return res.status(400).json({ success: false, message: 'Please provide document type and file.' });
    }

    const docRes = await pool.query(
      `INSERT INTO agent_documents (agent_id, doc_type, doc_name, doc_url, status)
       VALUES ($1, $2, $3, $4, 'submitted')
       RETURNING *`,
      [agentId, doc_type, finalName || 'KYC Document', finalUrl]
    );

    // Notify admins
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       SELECT id, 'New Agent KYC Document Uploaded', $1, 'agent_verification', '/admin/agents'
       FROM users WHERE role = 'admin'`,
      [`Agent ${req.user.name} uploaded new document "${doc_type}" for verification.`]
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded and submitted for admin verification.',
      data: docRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 7. ADMIN: Get all agents (SRS Section 7.2)
exports.getAdminAgents = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT 
        a.*,
        u.name, u.email, u.phone AS user_phone, u.avatar_url, u.is_active,
        (SELECT COUNT(*) FROM properties WHERE agent_id = a.id) AS total_properties_count,
        (SELECT COUNT(*) FROM properties WHERE agent_id = a.id AND status = 'published') AS published_count,
        (SELECT json_agg(ad.*) FROM agent_documents ad WHERE ad.agent_id = a.id) AS documents
      FROM agents a
      JOIN users u ON u.id = a.user_id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (status && status !== 'all') {
      sql += ` AND a.verification_status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (search && search.trim()) {
      sql += ` AND (u.name ILIKE $${pIdx} OR a.agency_name ILIKE $${pIdx} OR u.email ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    sql += ` ORDER BY CASE WHEN a.verification_status = 'pending' THEN 0 ELSE 1 END, a.created_at DESC`;

    const result = await pool.query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 8. ADMIN: Approve Agent KYC
exports.approveAgent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const agent = await pool.query('SELECT a.*, u.id AS user_id, u.name FROM agents a JOIN users u ON u.id = a.user_id WHERE a.id = $1', [id]);
    if (agent.rows.length === 0) return res.status(404).json({ success: false, message: 'Agent not found.' });

    await pool.query(
      `UPDATE agents SET verification_status = 'verified', rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    // Mark documents approved
    await pool.query(`UPDATE agent_documents SET status = 'approved' WHERE agent_id = $1`, [id]);

    // Notify agent
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, 'Agent Account Verified! ✅', 'Congratulations, your KYC verification has been approved by admin. You can now publish properties.', 'agent_verified', '/agent/dashboard')`,
      [agent.rows[0].user_id]
    );

    res.json({ success: true, message: `Agent ${agent.rows[0].name} has been verified.` });
  } catch (err) {
    next(err);
  }
};

// 9. ADMIN: Reject Agent KYC
exports.rejectAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a rejection reason.' });
    }

    const agent = await pool.query('SELECT a.*, u.id AS user_id, u.name FROM agents a JOIN users u ON u.id = a.user_id WHERE a.id = $1', [id]);
    if (agent.rows.length === 0) return res.status(404).json({ success: false, message: 'Agent not found.' });

    await pool.query(
      `UPDATE agents SET verification_status = 'rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [reason.trim(), id]
    );

    // Notify agent
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, 'KYC Verification Needs Revision ⚠️', $2, 'agent_rejected', '/agent/profile')`,
      [
        agent.rows[0].user_id,
        `Your verification application was rejected: ${reason.trim()}. Please review your details and re-upload valid documents.`
      ]
    );

    res.json({ success: true, message: 'Agent KYC rejected with feedback recorded.' });
  } catch (err) {
    next(err);
  }
};

// 10. ADMIN: Toggle Agent Active Status
exports.toggleAgentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await pool.query('SELECT user_id FROM agents WHERE id = $1', [id]);
    if (agent.rows.length === 0) return res.status(404).json({ success: false, message: 'Agent not found.' });

    const user = await pool.query(
      `UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_active`,
      [agent.rows[0].user_id]
    );

    res.json({
      success: true,
      message: `Agent account ${user.rows[0].is_active ? 'activated' : 'deactivated'}.`,
      isActive: user.rows[0].is_active
    });
  } catch (err) {
    next(err);
  }
};
