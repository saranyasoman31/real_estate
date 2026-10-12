const { pool } = require('../config/db');

async function seedDemoProperties() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting demo properties seeding for DARV Real Estate...');
    await client.query('BEGIN');

    // 1. Find Primary Agent (Saranya Soman)
    const agentRes = await client.query(`
      SELECT a.id, a.agency_name, u.email 
      FROM agents a 
      JOIN users u ON u.id = a.user_id 
      WHERE u.email IN ('darvproperties.com', 'saranyasoman31@gmail.com')
      LIMIT 1
    `);

    if (agentRes.rows.length === 0) {
      throw new Error("Default agent user not found. Please ensure database has been seeded.");
    }
    const agentId = agentRes.rows[0].id;
    console.log(`✓ Found primary agent (ID: ${agentId}, email: ${agentRes.rows[0].email})`);

    // 2. Fetch Property Types map
    const ptRes = await client.query('SELECT id, slug FROM property_types');
    const typeMap = {};
    ptRes.rows.forEach(r => { typeMap[r.slug] = r.id; });

    // 3. Fetch Amenities map
    const amRes = await client.query('SELECT id, name FROM amenities');
    const amenityMap = {};
    amRes.rows.forEach(r => { amenityMap[r.name] = r.id; });

    const getAmenityIds = (names) => {
      return names
        .map(n => amenityMap[n] || Object.keys(amenityMap).find(k => k.toLowerCase().includes(n.toLowerCase())) ? amenityMap[Object.keys(amenityMap).find(k => k.toLowerCase().includes(n.toLowerCase()))] : null)
        .filter(Boolean);
    };

    // 4. Property Definitions
    const propertiesData = [
      {
        id: 18, // Update existing test property
        ref_number: 'DARV-TVM-001',
        property_type_id: typeMap['apartment'] || 1,
        listing_type: 'sale',
        title: 'The Kowdiar Crown - 4 BHK Ultra Luxury Penthouse',
        description: 'An architectural marvel in Trivandrum’s most prestigious royal avenue. Featuring panoramic skyline views, double-height ceilings, private terrace deck, imported Italian marble flooring, and smart home automation. Certified K-RERA approved project by DARV Real Estate.',
        price: 26500000.00, // ₹2.65 Cr
        price_unit: 'total',
        land_area: 0,
        built_up_area: 3450,
        bedrooms: 4,
        bathrooms: 5,
        parking_spaces: 2,
        floor_no: 14,
        total_floors: 16,
        furnishing_status: 'fully-furnished',
        facing: 'East',
        year_built: 2024,
        address: 'Palace View Avenue, Kowdiar Main Road',
        locality: 'Kowdiar',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695003',
        latitude: 8.5241000,
        longitude: 76.9580000,
        status: 'published',
        approval_status: 'approved',
        is_featured: true,
        views_count: 420,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['Swimming Pool', 'Gymnasium & Fitness Center', '24/7 Security & CCTV', 'Power Backup (100%)', 'Clubhouse & Party Hall', 'High-Speed Elevators', 'EV Charging Stations']
      },
      {
        ref_number: 'DARV-TVM-002',
        property_type_id: typeMap['villa'] || 2,
        listing_type: 'sale',
        title: 'DARV Serene Palm - 4 BHK Designer Eco-Villa',
        description: 'Exquisite modern tropical villa situated in peaceful Sasthamangalam. Designed with natural Kerala stone, teakwood finishes, expansive landscaped courtyards, rain gardens, and solar power integration. Ideal for premium families seeking privacy and calm.',
        price: 18500000.00, // ₹1.85 Cr
        price_unit: 'total',
        land_area: 7.5,
        built_up_area: 2900,
        bedrooms: 4,
        bathrooms: 4,
        parking_spaces: 2,
        floor_no: 1,
        total_floors: 2,
        furnishing_status: 'semi-furnished',
        facing: 'North-East',
        year_built: 2024,
        address: 'Hill View Enclave, Sasthamangalam Junction',
        locality: 'Sasthamangalam',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695010',
        latitude: 8.5135000,
        longitude: 76.9682000,
        status: 'published',
        approval_status: 'approved',
        is_featured: true,
        views_count: 315,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['Landscaped Zen Gardens', '24/7 Security & CCTV', 'Covered Reserved Parking', 'Rainwater Harvesting', 'Power Backup (100%)', 'Children Play Area']
      },
      {
        ref_number: 'DARV-TVM-003',
        property_type_id: typeMap['apartment'] || 1,
        listing_type: 'sale',
        title: 'Techno Vista Heights - 3 BHK Premium Apartment near Technopark',
        description: 'Prime contemporary apartment located just 5 minutes from Technopark Phase 3 & Infosys campus. Offers spacious open-concept living, modern modular kitchen, scenic balcony views, and high rental yields. Perfect for IT professionals and high-return investors.',
        price: 8800000.00, // ₹88 Lakhs
        price_unit: 'total',
        land_area: 0,
        built_up_area: 1680,
        bedrooms: 3,
        bathrooms: 3,
        parking_spaces: 1,
        floor_no: 8,
        total_floors: 14,
        furnishing_status: 'semi-furnished',
        facing: 'East',
        year_built: 2023,
        address: 'Near Technopark Phase 3, Kazhakkoottam Bypass',
        locality: 'Kazhakkoottam',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695582',
        latitude: 8.5620000,
        longitude: 76.8770000,
        status: 'published',
        approval_status: 'approved',
        is_featured: true,
        views_count: 580,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['Swimming Pool', 'Gymnasium & Fitness Center', '24/7 Security & CCTV', 'Power Backup (100%)', 'High-Speed Elevators', 'EV Charging Stations', 'Clubhouse & Party Hall']
      },
      {
        ref_number: 'DARV-TVM-004',
        property_type_id: typeMap['house'] || 3,
        listing_type: 'sale',
        title: 'Royal Heritage Residence - 3 BHK Independent House in Pattom',
        description: 'Charming 3-bedroom independent family home on 6 cents of dry land in prime central Pattom. Features a private car porch, covered terrace, high-grade teak woodwork, well-ventilated rooms, and close proximity to Kendriya Vidyalaya and St. Mary’s School.',
        price: 12500000.00, // ₹1.25 Cr
        price_unit: 'total',
        land_area: 6.0,
        built_up_area: 2250,
        bedrooms: 3,
        bathrooms: 3,
        parking_spaces: 2,
        floor_no: 1,
        total_floors: 2,
        furnishing_status: 'semi-furnished',
        facing: 'East',
        year_built: 2022,
        address: 'Plamoodu - Medical College Link Road, Pattom',
        locality: 'Pattom',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695004',
        latitude: 8.5280000,
        longitude: 76.9420000,
        status: 'published',
        approval_status: 'approved',
        is_featured: false,
        views_count: 240,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['24/7 Security & CCTV', 'Covered Reserved Parking', 'Rainwater Harvesting', 'Power Backup (100%)']
      },
      {
        ref_number: 'DARV-TVM-005',
        property_type_id: typeMap['plot'] || 4,
        listing_type: 'sale',
        title: 'DARV Greenfield Enclave - 10 Cents Prime Residential Plot',
        description: 'Rare opportunity to acquire 10 cents of clear rectangular residential land in high-demand Vellayambalam-Althara area. Tar road frontage with water and electricity connections readily available. Clean freehold title verified by DARV legal team.',
        price: 7200000.00, // ₹72 Lakhs
        price_unit: 'total',
        land_area: 10.0,
        built_up_area: 0,
        bedrooms: 0,
        bathrooms: 0,
        parking_spaces: 0,
        floor_no: 0,
        total_floors: 0,
        furnishing_status: 'unfurnished',
        facing: 'North-East',
        year_built: 2024,
        address: 'Althara Nagar, Near Museum Police Station, Vellayambalam',
        locality: 'Vellayambalam',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695010',
        latitude: 8.5170000,
        longitude: 76.9585000,
        status: 'published',
        approval_status: 'approved',
        is_featured: false,
        views_count: 195,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['24/7 Security & CCTV', 'Rainwater Harvesting']
      },
      {
        ref_number: 'DARV-TVM-006',
        property_type_id: typeMap['commercial'] || 5,
        listing_type: 'sale',
        title: 'The Signature Tower - Grade-A IT & Corporate Office Space',
        description: 'Prime Grade-A commercial workspace spanning 4,200 sq.ft on Technopark Bypass. Fully plug-and-play with 60 workstations, 2 executive cabins, glass conference room, cafeteria pantry, server room, and central VRV air conditioning.',
        price: 34000000.00, // ₹3.40 Cr
        price_unit: 'total',
        land_area: 0,
        built_up_area: 4200,
        bedrooms: 0,
        bathrooms: 4,
        parking_spaces: 4,
        floor_no: 5,
        total_floors: 10,
        furnishing_status: 'fully-furnished',
        facing: 'North',
        year_built: 2024,
        address: 'Technopark Main Bypass, Kazhakkoottam',
        locality: 'Kazhakkoottam',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695583',
        latitude: 8.5580000,
        longitude: 76.8830000,
        status: 'published',
        approval_status: 'approved',
        is_featured: true,
        views_count: 380,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['High-Speed Elevators', 'Power Backup (100%)', '24/7 Security & CCTV', 'EV Charging Stations', 'Covered Reserved Parking']
      },
      {
        ref_number: 'DARV-TVM-007',
        property_type_id: typeMap['apartment'] || 1,
        listing_type: 'rent',
        title: 'Skyline Marine & Lakeview - 3 BHK Fully Furnished Luxury Rental',
        description: 'Breathtaking lakefront rental residence overlooking Akkulam Lake. Fully furnished with designer sofa suite, 65-inch 4K OLED, double-door refrigerator, washer-dryer, and high-speed fiber internet. Ready for immediate move-in.',
        price: 38000.00, // ₹38,000/month
        price_unit: 'month',
        land_area: 0,
        built_up_area: 1750,
        bedrooms: 3,
        bathrooms: 3,
        parking_spaces: 1,
        floor_no: 9,
        total_floors: 18,
        furnishing_status: 'fully-furnished',
        facing: 'West',
        year_built: 2023,
        address: 'Akkulam Boat Club Road, Ulloor - Akkulam',
        locality: 'Akkulam',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695017',
        latitude: 8.5290000,
        longitude: 76.9080000,
        status: 'published',
        approval_status: 'approved',
        is_featured: false,
        views_count: 490,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['Swimming Pool', 'Gymnasium & Fitness Center', '24/7 Security & CCTV', 'Power Backup (100%)', 'High-Speed Elevators', 'Clubhouse & Party Hall']
      },
      {
        ref_number: 'DARV-TVM-008',
        property_type_id: typeMap['villa'] || 2,
        listing_type: 'sale',
        title: 'Green Valley Contemporary 5 BHK Gated Estate Villa',
        description: 'Ultra-luxurious custom-built 5 BHK villa spanning 4,100 sq.ft on 12 cents in premier Vazhuthacaud. Boasts a private infinity plunge pool, double-height light-filled living salon, soundproof cinema suite, Italian kitchen, and servant quarters.',
        price: 32000000.00, // ₹3.20 Cr
        price_unit: 'total',
        land_area: 12.0,
        built_up_area: 4100,
        bedrooms: 5,
        bathrooms: 6,
        parking_spaces: 3,
        floor_no: 1,
        total_floors: 3,
        furnishing_status: 'fully-furnished',
        facing: 'East',
        year_built: 2024,
        address: 'Cotton Hill Enclave, Vazhuthacaud',
        locality: 'Vazhuthacaud',
        city: 'Trivandrum',
        state: 'Kerala',
        pincode: '695014',
        latitude: 8.5020000,
        longitude: 76.9620000,
        status: 'published',
        approval_status: 'approved',
        is_featured: true,
        views_count: 670,
        contact_preference: 'all',
        images: [
          { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', is_primary: true },
          { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80', is_primary: false },
          { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80', is_primary: false }
        ],
        amenities: ['Swimming Pool', 'Gymnasium & Fitness Center', 'Landscaped Zen Gardens', '24/7 Security & CCTV', 'Power Backup (100%)', 'EV Charging Stations']
      }
    ];

    for (const prop of propertiesData) {
      let propertyId;

      if (prop.id) {
        // Update existing property 18
        const updateSql = `
          UPDATE properties SET
            ref_number = $1,
            agent_id = $2,
            property_type_id = $3,
            listing_type = $4,
            title = $5,
            description = $6,
            price = $7,
            price_unit = $8,
            land_area = $9,
            built_up_area = $10,
            bedrooms = $11,
            bathrooms = $12,
            parking_spaces = $13,
            floor_no = $14,
            total_floors = $15,
            furnishing_status = $16,
            facing = $17,
            year_built = $18,
            address = $19,
            locality = $20,
            city = $21,
            state = $22,
            pincode = $23,
            latitude = $24,
            longitude = $25,
            status = $26,
            approval_status = $27,
            is_featured = $28,
            views_count = $29,
            contact_preference = $30,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $31
          RETURNING id;
        `;
        const res = await client.query(updateSql, [
          prop.ref_number, agentId, prop.property_type_id, prop.listing_type,
          prop.title, prop.description, prop.price, prop.price_unit,
          prop.land_area, prop.built_up_area, prop.bedrooms, prop.bathrooms,
          prop.parking_spaces, prop.floor_no, prop.total_floors, prop.furnishing_status,
          prop.facing, prop.year_built, prop.address, prop.locality,
          prop.city, prop.state, prop.pincode, prop.latitude, prop.longitude,
          prop.status, prop.approval_status, prop.is_featured, prop.views_count,
          prop.contact_preference, prop.id
        ]);
        propertyId = res.rows[0].id;
        console.log(`✓ Updated property ID ${propertyId}: ${prop.title}`);
      } else {
        // Insert new property
        const insertSql = `
          INSERT INTO properties (
            ref_number, agent_id, property_type_id, listing_type,
            title, description, price, price_unit, land_area, built_up_area,
            bedrooms, bathrooms, parking_spaces, floor_no, total_floors,
            furnishing_status, facing, year_built, address, locality,
            city, state, pincode, latitude, longitude,
            status, approval_status, is_featured, views_count, contact_preference
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25,
            $26, $27, $28, $29, $30
          )
          ON CONFLICT (ref_number) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            status = EXCLUDED.status,
            approval_status = EXCLUDED.approval_status,
            is_featured = EXCLUDED.is_featured,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id;
        `;
        const res = await client.query(insertSql, [
          prop.ref_number, agentId, prop.property_type_id, prop.listing_type,
          prop.title, prop.description, prop.price, prop.price_unit,
          prop.land_area, prop.built_up_area, prop.bedrooms, prop.bathrooms,
          prop.parking_spaces, prop.floor_no, prop.total_floors, prop.furnishing_status,
          prop.facing, prop.year_built, prop.address, prop.locality,
          prop.city, prop.state, prop.pincode, prop.latitude, prop.longitude,
          prop.status, prop.approval_status, prop.is_featured, prop.views_count,
          prop.contact_preference
        ]);
        propertyId = res.rows[0].id;
        console.log(`✓ Inserted property ID ${propertyId}: ${prop.title}`);
      }

      // Clean & insert images
      await client.query('DELETE FROM property_images WHERE property_id = $1', [propertyId]);
      for (let i = 0; i < prop.images.length; i++) {
        const img = prop.images[i];
        await client.query(`
          INSERT INTO property_images (property_id, image_url, is_primary, display_order)
          VALUES ($1, $2, $3, $4)
        `, [propertyId, img.url, img.is_primary, i + 1]);
      }

      // Clean & insert amenities
      await client.query('DELETE FROM property_amenities WHERE property_id = $1', [propertyId]);
      const amenityIds = getAmenityIds(prop.amenities);
      for (const aId of amenityIds) {
        await client.query(`
          INSERT INTO property_amenities (property_id, amenity_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [propertyId, aId]);
      }
    }

    await client.query('COMMIT');
    console.log('✅ Successfully seeded 8 high-quality demo properties for Trivandrum, Kerala!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDemoProperties().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seedDemoProperties;
