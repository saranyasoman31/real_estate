const { pool } = require('../../config/db');
const mailer = require('../../utils/mailer');

// 1. Submit property enquiry (Customer / Public)
exports.submitEnquiry = async (req, res, next) => {
  try {
    const {
      property_id,
      customer_name,
      customer_email,
      customer_phone,
      message,
      preferred_time,
      enquiry_type = 'enquiry'
    } = req.body;

    if (!property_id || !customer_name || !customer_email || !customer_phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required contact details and message.' });
    }

    const propRes = await pool.query(
      `SELECT p.id, p.title, p.ref_number, p.agent_id,
              u.name AS agent_name, COALESCE(a.email, u.email, 'saranyasoman31@gmail.com') AS agent_email
       FROM properties p
       LEFT JOIN agents a ON a.id = p.agent_id
       LEFT JOIN users u ON u.id = a.user_id
       WHERE p.id = $1`,
      [property_id]
    );

    if (propRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const prop = propRes.rows[0];
    const customerId = req.user ? req.user.id : null;

    const insertSql = `
      INSERT INTO property_enquiries (
        property_id, customer_id, customer_name, customer_email, customer_phone,
        message, preferred_time, enquiry_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
      RETURNING *;
    `;

    const result = await pool.query(insertSql, [
      property_id,
      customerId,
      customer_name.trim(),
      customer_email.toLowerCase().trim(),
      customer_phone.trim(),
      message.trim(),
      preferred_time || '',
      enquiry_type
    ]);

    // Send in-app notification to Agent / Client Owner
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       SELECT id, $1, $2, 'new_enquiry', '/admin/inquiries'
       FROM users WHERE role IN ('client', 'admin') LIMIT 1`,
      [
        `New ${enquiry_type === 'site_visit' ? 'Site Visit Request' : 'Customer Lead'} for ${prop.ref_number}!`,
        `${customer_name} submitted an enquiry for "${prop.title}". Phone: ${customer_phone}`
      ]
    );

    // Asynchronously dispatch email notification to the Agent's configured email
    const agentEmail = prop.agent_email || 'saranyasoman31@gmail.com';
    const agentName = prop.agent_name || 'Saranya Soman';

    mailer.sendNewInquiryAlertToAgent({
      agentEmail,
      agentName,
      customerName: customer_name.trim(),
      customerEmail: customer_email.toLowerCase().trim(),
      customerPhone: customer_phone.trim(),
      propertyTitle: prop.title,
      propertyRef: prop.ref_number,
      message: message.trim(),
      preferredTime: preferred_time,
      enquiryType: enquiry_type
    }).catch(err => console.error('[Enquiry Alert Email Error]', err));

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent to our sales advisory team. We will contact you shortly.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 2. CUSTOMER: Get my submitted enquiries
exports.getMyEnquiries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const sql = `
      SELECT pe.*,
             p.title AS property_title,
             p.ref_number,
             p.price,
             p.price_unit,
             p.city,
             p.listing_type,
             a.agency_name,
             COALESCE(a.phone, u.phone) AS agent_phone,
             (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image
      FROM property_enquiries pe
      JOIN properties p ON p.id = pe.property_id
      LEFT JOIN agents a ON a.id = p.agent_id
      LEFT JOIN users u ON u.id = a.user_id
      WHERE pe.customer_id = $1 OR pe.customer_email = $2
      ORDER BY pe.created_at DESC;
    `;

    const result = await pool.query(sql, [userId, userEmail]);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 3. CLIENT OWNER / AGENT: Get all customer leads & messages
exports.getClientEnquiries = async (req, res, next) => {
  try {
    const isClient = ['client', 'admin', 'super_admin', 'agent'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const { status, search } = req.query;

    let sql = `
      SELECT pe.*,
             p.title AS property_title,
             p.ref_number,
             p.price,
             p.price_unit,
             p.city,
             p.listing_type,
             (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image
      FROM property_enquiries pe
      JOIN properties p ON p.id = pe.property_id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (status && status !== 'all') {
      sql += ` AND pe.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (search && search.trim()) {
      sql += ` AND (pe.customer_name ILIKE $${pIdx} OR pe.customer_phone ILIKE $${pIdx} OR pe.customer_email ILIKE $${pIdx} OR p.title ILIKE $${pIdx} OR p.ref_number ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    sql += ` ORDER BY pe.created_at DESC`;

    const result = await pool.query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 4. CLIENT OWNER: Update enquiry status and notes (CRM)
exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, agent_notes } = req.body;
    const isClient = ['client', 'admin', 'super_admin', 'agent'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const updateSql = `
      UPDATE property_enquiries SET
        status = COALESCE($1, status),
        agent_notes = COALESCE($2, agent_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;

    const result = await pool.query(updateSql, [status, agent_notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Lead stage updated successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 5. CLIENT OWNER / AGENT: Push direct email reply to customer
exports.pushEmailToCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    const isClient = ['client', 'admin', 'super_admin', 'agent'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide message content for the email push.' });
    }

    // Fetch enquiry & property details
    const enqRes = await pool.query(
      `SELECT pe.*, p.title AS property_title, p.ref_number
       FROM property_enquiries pe
       JOIN properties p ON p.id = pe.property_id
       WHERE pe.id = $1`,
      [id]
    );

    if (enqRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer inquiry not found.' });
    }

    const enq = enqRes.rows[0];

    // Fetch active agent profile details
    const agentRes = await pool.query(
      `SELECT u.name, 
              COALESCE(a.email, u.email, 'saranyasoman31@gmail.com') AS email, 
              COALESCE(a.phone, u.phone, '+91 98470 12345') AS phone, 
              COALESCE(a.whatsapp, '+919847012345') AS whatsapp, 
              COALESCE(a.website, 'https://apexrealty-trivandrum.com') AS website, 
              COALESCE(a.office_address, 'Trivandrum, Kerala') AS address
       FROM users u
       LEFT JOIN agents a ON a.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    const agent = agentRes.rows[0] || {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || '+91 98470 12345',
      whatsapp: '+919847012345',
      website: 'https://apexrealty-trivandrum.com',
      address: 'Trivandrum, Kerala'
    };

    const emailSubject = subject && subject.trim() 
      ? subject.trim() 
      : `Regarding your property enquiry for "${enq.property_title}" - Apex Realty`;

    // Send email to customer via mailer
    await mailer.sendEmailPushToCustomer({
      agentEmail: agent.email,
      agentName: agent.name,
      agentPhone: agent.phone,
      agentWhatsapp: agent.whatsapp,
      agentWebsite: agent.website,
      agentAddress: agent.address,
      customerEmail: enq.customer_email,
      customerName: enq.customer_name,
      propertyTitle: enq.property_title,
      subject: emailSubject,
      message: message.trim()
    });

    // Save into email logs table
    const logRes = await pool.query(
      `INSERT INTO enquiry_email_logs (enquiry_id, recipient_email, sender_email, subject, message, status)
       VALUES ($1, $2, $3, $4, $5, 'sent')
       RETURNING *`,
      [id, enq.customer_email, agent.email, emailSubject, message.trim()]
    );

    // Update enquiry record: mark as contacted, update last_email_push_at, increment count
    const updatedEnqRes = await pool.query(
      `UPDATE property_enquiries SET
        status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
        last_email_push_at = CURRENT_TIMESTAMP,
        email_push_count = COALESCE(email_push_count, 0) + 1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      message: `Email pushed successfully to ${enq.customer_name} (${enq.customer_email})!`,
      data: updatedEnqRes.rows[0],
      log: logRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 6. CLIENT OWNER / AGENT: Get email push history for an inquiry
exports.getEmailPushHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isClient = ['client', 'admin', 'super_admin', 'agent'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const logs = await pool.query(
      `SELECT * FROM enquiry_email_logs WHERE enquiry_id = $1 ORDER BY sent_at DESC`,
      [id]
    );

    res.json({ success: true, count: logs.rows.length, data: logs.rows });
  } catch (err) {
    next(err);
  }
};
