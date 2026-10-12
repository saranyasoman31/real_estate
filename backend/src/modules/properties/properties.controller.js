const { pool } = require('../../config/db');

const safeInt = (val, defaultVal = null) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultVal : parsed;
};

const safeFloat = (val, defaultVal = null) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? defaultVal : parsed;
};

// 1. PUBLIC: Search and filter properties
exports.getPublicProperties = async (req, res, next) => {
  try {
    const {
      keyword,
      type,
      property_type_id,
      listing_type,
      city,
      state,
      locality,
      min_price,
      max_price,
      min_area,
      max_area,
      bedrooms,
      bathrooms,
      furnishing,
      is_featured,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let paramIndex = 1;

    let whereClause = `WHERE p.status = 'published'`;

    if (keyword && keyword.trim()) {
      whereClause += ` AND (
        p.title ILIKE $${paramIndex} OR
        p.description ILIKE $${paramIndex} OR
        p.address ILIKE $${paramIndex} OR
        p.locality ILIKE $${paramIndex} OR
        p.city ILIKE $${paramIndex} OR
        p.ref_number ILIKE $${paramIndex}
      )`;
      params.push(`%${keyword.trim()}%`);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND (pt.slug = $${paramIndex} OR pt.name ILIKE $${paramIndex})`;
      params.push(type.trim());
      paramIndex++;
    }

    if (property_type_id) {
      whereClause += ` AND p.property_type_id = $${paramIndex}`;
      params.push(parseInt(property_type_id, 10));
      paramIndex++;
    }

    if (listing_type && ['sale', 'rent'].includes(listing_type.toLowerCase())) {
      whereClause += ` AND p.listing_type = $${paramIndex}`;
      params.push(listing_type.toLowerCase());
      paramIndex++;
    }

    if (city && city.trim() && city.toLowerCase() !== 'all') {
      whereClause += ` AND p.city ILIKE $${paramIndex}`;
      params.push(city.trim());
      paramIndex++;
    }

    if (state && state.trim()) {
      whereClause += ` AND p.state ILIKE $${paramIndex}`;
      params.push(state.trim());
      paramIndex++;
    }

    if (locality && locality.trim()) {
      whereClause += ` AND p.locality ILIKE $${paramIndex}`;
      params.push(`%${locality.trim()}%`);
      paramIndex++;
    }

    if (min_price) {
      whereClause += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price) {
      whereClause += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    if (min_area) {
      whereClause += ` AND (p.built_up_area >= $${paramIndex} OR p.land_area >= $${paramIndex})`;
      params.push(parseFloat(min_area));
      paramIndex++;
    }

    if (max_area) {
      whereClause += ` AND (p.built_up_area <= $${paramIndex} OR p.land_area <= $${paramIndex})`;
      params.push(parseFloat(max_area));
      paramIndex++;
    }

    if (bedrooms && parseInt(bedrooms, 10) > 0) {
      if (parseInt(bedrooms, 10) >= 4) {
        whereClause += ` AND p.bedrooms >= $${paramIndex}`;
      } else {
        whereClause += ` AND p.bedrooms = $${paramIndex}`;
      }
      params.push(parseInt(bedrooms, 10));
      paramIndex++;
    }

    if (bathrooms && parseInt(bathrooms, 10) > 0) {
      whereClause += ` AND p.bathrooms >= $${paramIndex}`;
      params.push(parseInt(bathrooms, 10));
      paramIndex++;
    }

    if (furnishing && furnishing.trim()) {
      whereClause += ` AND p.furnishing_status = $${paramIndex}`;
      params.push(furnishing.trim());
      paramIndex++;
    }

    if (is_featured === 'true' || is_featured === true) {
      whereClause += ` AND p.is_featured = true`;
    }

    // Sort order
    let orderBy = 'ORDER BY p.is_featured DESC, p.created_at DESC';
    if (sort === 'price_asc') {
      orderBy = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'ORDER BY p.price DESC';
    } else if (sort === 'popular') {
      orderBy = 'ORDER BY p.views_count DESC, p.created_at DESC';
    } else if (sort === 'newest') {
      orderBy = 'ORDER BY p.created_at DESC';
    }

    // Count query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM properties p
      JOIN property_types pt ON pt.id = p.property_type_id
      ${whereClause}
    `;
    const countRes = await pool.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Main query
    const querySql = `
      SELECT 
        p.*,
        pt.name AS property_type_name,
        pt.slug AS property_type_slug,
        a.id AS agent_id,
        a.agency_name,
        a.rating AS agent_rating,
        a.verification_status AS agent_verification,
        u.name AS agent_name,
        u.phone AS agent_phone,
        u.avatar_url AS agent_avatar,
        (
          SELECT json_agg(json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_primary', pi.is_primary, 'display_order', pi.display_order) ORDER BY pi.is_primary DESC, pi.display_order ASC)
          FROM property_images pi
          WHERE pi.property_id = p.id
        ) AS images,
        (
          SELECT COALESCE(pi.image_url, '')
          FROM property_images pi
          WHERE pi.property_id = p.id AND pi.is_primary = true
          LIMIT 1
        ) AS primary_image,
        ${req.user ? `EXISTS(SELECT 1 FROM favorites f WHERE f.property_id = p.id AND f.user_id = ${req.user.id})` : 'false'} AS is_favorited
      FROM properties p
      JOIN property_types pt ON pt.id = p.property_type_id
      JOIN agents a ON a.id = p.agent_id
      JOIN users u ON u.id = a.user_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit, 10), offset);
    const result = await pool.query(querySql, params);

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      limit: parseInt(limit, 10),
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// 2. PUBLIC: Get Single Property Detail
exports.getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const propertyRes = await pool.query(
      `SELECT 
        p.*,
        pt.name AS property_type_name,
        pt.slug AS property_type_slug,
        a.id AS agent_id,
        a.agency_name,
        a.license_number AS agent_license,
        a.bio AS agent_bio,
        a.rating AS agent_rating,
        a.total_sales AS agent_sales,
        a.experience_years AS agent_experience,
        COALESCE(a.whatsapp, '+919847012345') AS agent_whatsapp,
        COALESCE(a.office_address, 'Trivandrum, Kerala') AS agent_office,
        COALESCE(a.office_address, 'Trivandrum, Kerala') AS agent_address,
        COALESCE(a.website, 'https://apexrealty-trivandrum.com') AS agent_website,
        a.verification_status AS agent_verification,
        u.name AS agent_name,
        COALESCE(a.email, u.email, 'saranyasoman31@gmail.com') AS agent_email,
        COALESCE(a.phone, u.phone, '+91 98470 12345') AS agent_phone,
        COALESCE(a.logo_url, u.avatar_url) AS agent_avatar,
        COALESCE(a.logo_url, u.avatar_url) AS agent_logo,
        ${req.user ? `EXISTS(SELECT 1 FROM favorites f WHERE f.property_id = p.id AND f.user_id = ${req.user.id})` : 'false'} AS is_favorited
       FROM properties p
       JOIN property_types pt ON pt.id = p.property_type_id
       JOIN agents a ON a.id = p.agent_id
       JOIN users u ON u.id = a.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (propertyRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const property = propertyRes.rows[0];

    // Fetch images
    const imagesRes = await pool.query(
      `SELECT id, image_url, is_primary, display_order 
       FROM property_images 
       WHERE property_id = $1 
       ORDER BY is_primary DESC, display_order ASC`,
      [id]
    );
    property.images = imagesRes.rows;

    // Fetch amenities
    const amenitiesRes = await pool.query(
      `SELECT a.id, a.name, a.category, a.icon
       FROM amenities a
       JOIN property_amenities pa ON pa.amenity_id = a.id
       WHERE pa.property_id = $1`,
      [id]
    );
    property.amenities = amenitiesRes.rows;

    // Increment view count asynchronously
    pool.query(`UPDATE properties SET views_count = views_count + 1 WHERE id = $1`, [id]).catch(console.error);

    // Fetch similar properties
    const similarRes = await pool.query(
      `SELECT p.id, p.ref_number, p.title, p.price, p.price_unit, p.bedrooms, p.bathrooms,
              p.built_up_area, p.city, p.locality, p.listing_type, pt.name AS property_type_name,
              (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image
       FROM properties p
       JOIN property_types pt ON pt.id = p.property_type_id
       WHERE p.id != $1 AND p.status = 'published' AND (p.city = $2 OR p.property_type_id = $3)
       LIMIT 4`,
      [id, property.city, property.property_type_id]
    );

    res.json({
      success: true,
      data: property,
      similarProperties: similarRes.rows
    });
  } catch (err) {
    next(err);
  }
};

// 3. CUSTOMER: Toggle Favorite
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2',
      [userId, id]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE id = $1', [existing.rows[0].id]);
      return res.json({ success: true, isFavorited: false, message: 'Property removed from saved favorites.' });
    } else {
      await pool.query('INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)', [userId, id]);
      return res.json({ success: true, isFavorited: true, message: 'Property saved to favorites.' });
    }
  } catch (err) {
    next(err);
  }
};

// 4. CUSTOMER: Get My Favorites
exports.getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT p.*,
             pt.name AS property_type_name,
             pt.slug AS property_type_slug,
             a.agency_name,
             u.name AS agent_name,
             u.phone AS agent_phone,
             (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image,
             f.created_at AS favorited_at
      FROM favorites f
      JOIN properties p ON p.id = f.property_id
      JOIN property_types pt ON pt.id = p.property_type_id
      JOIN agents a ON a.id = p.agent_id
      JOIN users u ON u.id = a.user_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 5. CLIENT OWNER: Get All Client Properties
exports.getClientProperties = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT p.*,
             pt.name AS property_type_name,
             pt.slug AS property_type_slug,
             (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) AS primary_image,
             (SELECT COUNT(*) FROM property_enquiries WHERE property_id = p.id) AS enquiry_count
      FROM properties p
      JOIN property_types pt ON pt.id = p.property_type_id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (status && status !== 'all') {
      sql += ` AND p.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (search && search.trim()) {
      sql += ` AND (p.title ILIKE $${pIdx} OR p.ref_number ILIKE $${pIdx} OR p.city ILIKE $${pIdx})`;
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    sql += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(sql, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 6. CLIENT OWNER: Create Property (Directly Published by Owner)
exports.createProperty = async (req, res, next) => {
  try {
    const isClient = ['client', 'admin', 'super_admin'].includes(req.user.role);
    if (!isClient) {
      return res.status(403).json({ success: false, message: 'Only the property owner can upload properties.' });
    }

    // Get client's agent record ID
    let agentId = req.user.agent_id;
    if (!agentId) {
      const a = await pool.query('SELECT id FROM agents LIMIT 1');
      agentId = a.rows[0]?.id || 1;
    }

    const {
      title,
      description,
      property_type_id,
      listing_type = 'sale',
      price,
      price_unit = 'total',
      land_area,
      built_up_area,
      bedrooms = 0,
      bathrooms = 0,
      parking_spaces = 0,
      floor_no,
      total_floors,
      furnishing_status = 'unfurnished',
      facing,
      year_built,
      address,
      locality,
      city,
      state = 'Maharashtra',
      pincode,
      latitude,
      longitude,
      video_url,
      contact_preference = 'all',
      is_draft = false,
      images = [],
      amenities = []
    } = req.body;

    if (!title || !price || !property_type_id || !city || !address) {
      return res.status(400).json({ success: false, message: 'Please provide title, price, property type, address and city.' });
    }

    const ref_number = `PROP-${Math.floor(100000 + Math.random() * 900000)}`;
    const status = is_draft ? 'draft' : 'published';
    const approval_status = 'approved'; // Direct publishing for single client

    const insertSql = `
      INSERT INTO properties (
        ref_number, agent_id, property_type_id, listing_type, title, description,
        price, price_unit, land_area, built_up_area, bedrooms, bathrooms, parking_spaces,
        floor_no, total_floors, furnishing_status, facing, year_built, address, locality, city, state, pincode,
        latitude, longitude, video_url, status, approval_status, is_featured, contact_preference
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28, false, $29
      ) RETURNING *;
    `;

    const propResult = await pool.query(insertSql, [
      ref_number,
      agentId,
      parseInt(property_type_id, 10),
      listing_type,
      title.trim(),
      description || '',
      parseFloat(price),
      price_unit,
      land_area ? parseFloat(land_area) : 0,
      built_up_area ? parseFloat(built_up_area) : 0,
      parseInt(bedrooms || 0, 10),
      parseInt(bathrooms || 0, 10),
      parseInt(parking_spaces || 0, 10),
      floor_no ? parseInt(floor_no, 10) : null,
      total_floors ? parseInt(total_floors, 10) : null,
      furnishing_status,
      facing || '',
      year_built ? parseInt(year_built, 10) : null,
      address.trim(),
      locality || '',
      city.trim(),
      state,
      pincode || '',
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      video_url || '',
      status,
      approval_status,
      contact_preference
    ]);

    const newProperty = propResult.rows[0];

    // Insert Images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].url;
        const isPrimary = i === 0 || (images[i] && images[i].is_primary);
        await pool.query(
          `INSERT INTO property_images (property_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)`,
          [newProperty.id, imgUrl, isPrimary, i]
        );
      }
    }

    // Insert Amenities
    if (Array.isArray(amenities) && amenities.length > 0) {
      for (const amenityId of amenities) {
        await pool.query(
          `INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newProperty.id, parseInt(amenityId, 10)]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: is_draft ? 'Property saved as draft.' : 'Property published successfully to the marketplace!',
      data: newProperty
    });
  } catch (err) {
    next(err);
  }
};

// 7. CLIENT OWNER: Update Property
exports.updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isClient = ['client', 'admin', 'super_admin'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const {
      title,
      description,
      property_type_id,
      listing_type,
      price,
      price_unit,
      land_area,
      built_up_area,
      bedrooms,
      bathrooms,
      parking_spaces,
      floor_no,
      total_floors,
      furnishing_status,
      facing,
      year_built,
      address,
      locality,
      city,
      state,
      pincode,
      latitude,
      longitude,
      video_url,
      contact_preference,
      status,
      images,
      amenities
    } = req.body;

    const updateSql = `
      UPDATE properties SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        property_type_id = COALESCE($3, property_type_id),
        listing_type = COALESCE($4, listing_type),
        price = COALESCE($5, price),
        price_unit = COALESCE($6, price_unit),
        land_area = COALESCE($7, land_area),
        built_up_area = COALESCE($8, built_up_area),
        bedrooms = COALESCE($9, bedrooms),
        bathrooms = COALESCE($10, bathrooms),
        parking_spaces = COALESCE($11, parking_spaces),
        floor_no = COALESCE($12, floor_no),
        total_floors = COALESCE($13, total_floors),
        furnishing_status = COALESCE($14, furnishing_status),
        facing = COALESCE($15, facing),
        year_built = COALESCE($16, year_built),
        address = COALESCE($17, address),
        locality = COALESCE($18, locality),
        city = COALESCE($19, city),
        state = COALESCE($20, state),
        pincode = COALESCE($21, pincode),
        latitude = COALESCE($22, latitude),
        longitude = COALESCE($23, longitude),
        video_url = COALESCE($24, video_url),
        contact_preference = COALESCE($25, contact_preference),
        status = COALESCE($26, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $27
      RETURNING *;
    `;

    const updatedResult = await pool.query(updateSql, [
      title ? title.trim() : null,
      description !== undefined ? description : null,
      safeInt(property_type_id),
      listing_type || null,
      safeFloat(price),
      price_unit || null,
      safeFloat(land_area),
      safeFloat(built_up_area),
      safeInt(bedrooms),
      safeInt(bathrooms),
      safeInt(parking_spaces),
      safeInt(floor_no),
      safeInt(total_floors),
      furnishing_status || null,
      facing || null,
      safeInt(year_built),
      address ? address.trim() : null,
      locality || null,
      city ? city.trim() : null,
      state || null,
      pincode || null,
      safeFloat(latitude),
      safeFloat(longitude),
      video_url !== undefined ? video_url : null,
      contact_preference || null,
      status || null,
      id
    ]);

    if (updatedResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (Array.isArray(images)) {
      await pool.query('DELETE FROM property_images WHERE property_id = $1', [id]);
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const imgUrl = typeof item === 'string' ? item : (item?.url || item?.image_url);
        if (imgUrl) {
          const isPrimary = i === 0 || Boolean(item?.is_primary);
          await pool.query(
            `INSERT INTO property_images (property_id, image_url, is_primary, display_order)
             VALUES ($1, $2, $3, $4)`,
            [id, imgUrl, isPrimary, i]
          );
        }
      }
    }

    if (Array.isArray(amenities)) {
      await pool.query('DELETE FROM property_amenities WHERE property_id = $1', [id]);
      for (const amenityId of amenities) {
        const parsedAmenityId = safeInt(amenityId);
        if (parsedAmenityId) {
          await pool.query(
            `INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, parsedAmenityId]
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Property updated successfully.',
      data: updatedResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 8. CLIENT OWNER: Change Status (published / sold / rented / draft)
exports.changeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isClient = ['client', 'admin', 'super_admin'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const allowed = ['published', 'sold', 'rented', 'draft', 'inactive'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    await pool.query(
      `UPDATE properties SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );

    res.json({ success: true, message: `Property status marked as ${status}.` });
  } catch (err) {
    next(err);
  }
};

// 9. CLIENT OWNER: Toggle Featured Status
exports.toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isClient = ['client', 'admin', 'super_admin'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const result = await pool.query(
      `UPDATE properties 
       SET is_featured = NOT is_featured, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, title, is_featured`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Property not found.' });

    res.json({
      success: true,
      message: `Property ${result.rows[0].is_featured ? 'marked as featured on home' : 'removed from featured'}.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 10. CLIENT OWNER: Delete Property
exports.deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isClient = ['client', 'admin', 'super_admin'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    await pool.query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// 11. CLIENT OWNER: Dashboard KPI Metrics
exports.getClientDashboardStats = async (req, res, next) => {
  try {
    const isClient = ['client', 'admin', 'super_admin'].includes(req.user.role);
    if (!isClient) return res.status(403).json({ success: false, message: 'Unauthorized.' });

    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM properties) AS total_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'published') AS published_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'sold') AS sold_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'rented') AS rented_properties,
        (SELECT COUNT(*) FROM properties WHERE status = 'draft') AS draft_properties,
        (SELECT COUNT(*) FROM properties WHERE is_featured = true) AS featured_properties,
        (SELECT COALESCE(SUM(views_count), 0) FROM properties) AS total_views,
        (SELECT COUNT(*) FROM property_enquiries) AS total_enquiries,
        (SELECT COUNT(*) FROM property_enquiries WHERE status = 'new') AS new_enquiries
    `);

    // Properties by category breakdown
    const typeDistribution = await pool.query(`
      SELECT pt.name, pt.slug, COUNT(p.id) AS count
      FROM property_types pt
      LEFT JOIN properties p ON p.property_type_id = pt.id
      GROUP BY pt.id, pt.name, pt.slug
      ORDER BY count DESC
    `);

    // Recent 5 leads
    const recentEnquiries = await pool.query(`
      SELECT pe.*, p.title AS property_title, p.ref_number
      FROM property_enquiries pe
      JOIN properties p ON p.id = pe.property_id
      ORDER BY pe.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: statsRes.rows[0],
      byType: typeDistribution.rows,
      recentEnquiries: recentEnquiries.rows
    });
  } catch (err) {
    next(err);
  }
};
