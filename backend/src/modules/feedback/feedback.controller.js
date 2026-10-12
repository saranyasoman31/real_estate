const { pool } = require('../../config/db');

// Helper: Calculate Trust Score Metrics from reviews
const computeTrustMetrics = (reviews) => {
  const total = reviews.length;
  if (total === 0) {
    return {
      trustScore: 100, // Verified agent default baseline
      averageRating: 5.0,
      totalReviews: 0,
      positivePercentage: 100,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      isBaseline: true
    };
  }

  let sum = 0;
  let positiveCount = 0;
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((r) => {
    const stars = Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5));
    sum += stars;
    if (breakdown[stars] !== undefined) breakdown[stars]++;
    if (stars >= 4) positiveCount++;
  });

  const avg = parseFloat((sum / total).toFixed(1));
  // Trust score: 60% based on average rating + 40% based on positive review ratio
  const ratingWeight = (avg / 5) * 60;
  const positiveWeight = (positiveCount / total) * 40;
  const trustScore = Math.min(100, Math.round(ratingWeight + positiveWeight));

  return {
    trustScore,
    averageRating: avg,
    totalReviews: total,
    positivePercentage: Math.round((positiveCount / total) * 100),
    breakdown,
    isBaseline: false
  };
};

// 1. PUBLIC / CUSTOMER: Submit Customer Feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const {
      rating,
      customer_name,
      customer_email,
      customer_phone,
      category,
      feedback_title,
      comment,
      property_id
    } = req.body;

    const parsedRating = parseInt(rating, 10);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Please select a rating between 1 and 5 stars.' });
    }

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Your name is required.' });
    }

    if (!customer_email || !customer_email.trim()) {
      return res.status(400).json({ success: false, message: 'Your email address is required.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Please write your feedback comment.' });
    }

    // Resolve target agent ID
    let agentId = req.body.agent_id ? parseInt(req.body.agent_id, 10) : null;
    let agentUserId = null;

    if (!agentId) {
      const primaryAgentRes = await pool.query(
        `SELECT id, user_id FROM agents ORDER BY id ASC LIMIT 1`
      );
      if (primaryAgentRes.rows.length > 0) {
        agentId = primaryAgentRes.rows[0].id;
        agentUserId = primaryAgentRes.rows[0].user_id;
      }
    } else {
      const agentRes = await pool.query(`SELECT user_id FROM agents WHERE id = $1`, [agentId]);
      if (agentRes.rows.length > 0) {
        agentUserId = agentRes.rows[0].user_id;
      }
    }

    const userId = req.user ? req.user.id : null;
    const propertyIdInt = property_id ? parseInt(property_id, 10) : null;

    const insertSql = `
      INSERT INTO customer_feedback (
        agent_id,
        user_id,
        property_id,
        customer_name,
        customer_email,
        customer_phone,
        rating,
        category,
        feedback_title,
        comment,
        is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *;
    `;

    const result = await pool.query(insertSql, [
      agentId,
      userId,
      propertyIdInt,
      customer_name.trim(),
      customer_email.trim().toLowerCase(),
      customer_phone ? customer_phone.trim() : null,
      parsedRating,
      category ? category.trim() : 'Overall Experience',
      feedback_title ? feedback_title.trim() : null,
      comment.trim()
    ]);

    const newFeedback = result.rows[0];

    // Update agent's overall rating in agents table
    if (agentId) {
      await pool.query(
        `UPDATE agents 
         SET rating = (SELECT ROUND(AVG(rating), 2) FROM customer_feedback WHERE agent_id = $1 AND is_approved = true)
         WHERE id = $1`,
        [agentId]
      );
    }

    // Send in-app notification to the agent
    if (agentUserId) {
      const starsDisplay = '★'.repeat(parsedRating);
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          agentUserId,
          `New ${parsedRating}-Star Feedback from ${customer_name.trim()}`,
          `Customer ${customer_name.trim()} submitted feedback (${starsDisplay}): "${comment.trim().substring(0, 100)}..."`,
          'feedback',
          '/admin/feedback'
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded successfully.',
      data: newFeedback
    });
  } catch (err) {
    next(err);
  }
};

// 2. PUBLIC: Get Approved Customer Reviews & Overall Trust Metrics
exports.getPublicFeedback = async (req, res, next) => {
  try {
    const { property_id, limit = 20 } = req.query;

    let query = `
      SELECT 
        cf.id,
        cf.customer_name,
        cf.rating,
        cf.category,
        cf.feedback_title,
        cf.comment,
        cf.is_featured,
        cf.agent_reply,
        cf.agent_replied_at,
        cf.created_at,
        p.title AS property_title,
        p.id AS property_id
      FROM customer_feedback cf
      LEFT JOIN properties p ON p.id = cf.property_id
      WHERE cf.is_approved = true
    `;
    const params = [];

    if (property_id) {
      params.push(parseInt(property_id, 10));
      query += ` AND cf.property_id = $${params.length}`;
    }

    query += ` ORDER BY cf.is_featured DESC, cf.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));

    const result = await pool.query(query, params);

    // Fetch all approved feedback to compute stats
    const allApproved = await pool.query(
      `SELECT rating FROM customer_feedback WHERE is_approved = true`
    );
    const metrics = computeTrustMetrics(allApproved.rows);

    res.json({
      success: true,
      metrics,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// 3. PUBLIC: Get Customer Trust Score Summary Stats
exports.getTrustStats = async (req, res, next) => {
  try {
    const allApproved = await pool.query(
      `SELECT rating FROM customer_feedback WHERE is_approved = true`
    );
    const metrics = computeTrustMetrics(allApproved.rows);

    res.json({
      success: true,
      metrics
    });
  } catch (err) {
    next(err);
  }
};

// 4. AGENT / CLIENT: Get All Customer Feedback in Agent Portal
exports.getAgentFeedback = async (req, res, next) => {
  try {
    const { search, rating, category, page = 1, limit = 50 } = req.query;

    let sql = `
      SELECT 
        cf.*,
        p.title AS property_title,
        p.ref_number AS property_ref,
        u.name AS registered_user_name
      FROM customer_feedback cf
      LEFT JOIN properties p ON p.id = cf.property_id
      LEFT JOIN users u ON u.id = cf.user_id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (search && search.trim()) {
      sql += ` AND (
        cf.customer_name ILIKE $${pIdx} OR 
        cf.customer_email ILIKE $${pIdx} OR 
        cf.comment ILIKE $${pIdx} OR
        cf.feedback_title ILIKE $${pIdx}
      )`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    if (rating && rating !== 'all') {
      sql += ` AND cf.rating = $${pIdx}`;
      params.push(parseInt(rating, 10));
      pIdx++;
    }

    if (category && category !== 'all') {
      sql += ` AND cf.category = $${pIdx}`;
      params.push(category);
      pIdx++;
    }

    sql += ` ORDER BY cf.created_at DESC`;

    const result = await pool.query(sql, params);

    // Compute stats for all agent feedback
    const allReviews = await pool.query(`SELECT rating FROM customer_feedback`);
    const metrics = computeTrustMetrics(allReviews.rows);

    res.json({
      success: true,
      metrics,
      total: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// 5. AGENT / CLIENT: Reply to Customer Feedback
exports.replyToFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const replyMessage = req.body.reply || req.body.agent_reply;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }

    const result = await pool.query(
      `UPDATE customer_feedback
       SET agent_reply = $1, agent_replied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [replyMessage.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    res.json({
      success: true,
      message: 'Agent response added to customer feedback.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 6. AGENT / CLIENT: Toggle Featured Status (Pin on Public Site)
exports.toggleFeaturedFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE customer_feedback
       SET is_featured = NOT is_featured, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    const item = result.rows[0];
    res.json({
      success: true,
      message: item.is_featured ? 'Feedback pinned to featured testimonials!' : 'Removed from featured.',
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// 7. AGENT / CLIENT: Delete Customer Feedback
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const itemRes = await pool.query(`SELECT agent_id FROM customer_feedback WHERE id = $1`, [id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    const agentId = itemRes.rows[0].agent_id;
    await pool.query(`DELETE FROM customer_feedback WHERE id = $1`, [id]);

    // Recalculate agent rating
    if (agentId) {
      await pool.query(
        `UPDATE agents 
         SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM customer_feedback WHERE agent_id = $1 AND is_approved = true), 5.0)
         WHERE id = $1`,
        [agentId]
      );
    }

    res.json({
      success: true,
      message: 'Customer feedback deleted.'
    });
  } catch (err) {
    next(err);
  }
};
