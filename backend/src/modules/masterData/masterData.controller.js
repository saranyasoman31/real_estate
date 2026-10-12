const { pool } = require('../../config/db');

// 1. Get Property Types
exports.getPropertyTypes = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT pt.*, (SELECT COUNT(*) FROM properties WHERE property_type_id = pt.id AND status = 'published') AS property_count
       FROM property_types pt
       WHERE pt.is_active = true
       ORDER BY pt.name ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 2. Get Amenities
exports.getAmenities = async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM amenities ORDER BY category, name ASC`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// 3. Get Locations (States, Cities, Localities)
exports.getLocations = async (req, res, next) => {
  try {
    const states = await pool.query('SELECT * FROM states ORDER BY name ASC');
    const cities = await pool.query(`
      SELECT c.*, s.name AS state_name,
        (SELECT COUNT(*) FROM properties WHERE city ILIKE c.name AND status = 'published') AS property_count
      FROM cities c
      JOIN states s ON s.id = c.state_id
      ORDER BY c.is_popular DESC, c.name ASC
    `);

    res.json({
      success: true,
      states: states.rows,
      cities: cities.rows
    });
  } catch (err) {
    next(err);
  }
};

// 4. Get Banners
exports.getBanners = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM banners WHERE is_active = true ORDER BY display_order ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// --- ADMIN MASTER DATA CRUD ---

// Create Property Type
exports.createPropertyType = async (req, res, next) => {
  try {
    const { name, slug, icon, description } = req.body;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = await pool.query(
      `INSERT INTO property_types (name, slug, icon, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, finalSlug, icon || 'Home', description || '']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Create Amenity
exports.createAmenity = async (req, res, next) => {
  try {
    const { name, category, icon } = req.body;
    const result = await pool.query(
      `INSERT INTO amenities (name, category, icon) VALUES ($1, $2, $3) RETURNING *`,
      [name, category || 'general', icon || 'CheckCircle']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Create City
exports.createCity = async (req, res, next) => {
  try {
    const { state_id, name, image_url, is_popular } = req.body;
    const result = await pool.query(
      `INSERT INTO cities (state_id, name, image_url, is_popular) VALUES ($1, $2, $3, $4) RETURNING *`,
      [state_id, name, image_url, !!is_popular]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Delete Master Data Entry
exports.deleteMasterData = async (req, res, next) => {
  try {
    const { entity, id } = req.params;
    const allowed = ['property_types', 'amenities', 'cities', 'states', 'banners'];
    if (!allowed.includes(entity)) {
      return res.status(400).json({ success: false, message: 'Invalid entity name.' });
    }
    await pool.query(`DELETE FROM ${entity} WHERE id = $1`, [id]);
    res.json({ success: true, message: `${entity} item deleted successfully.` });
  } catch (err) {
    next(err);
  }
};
