-- =====================================================================
-- REAL ESTATE MARKETPLACE PLATFORM - DATABASE SCHEMA (PostgreSQL)
-- Compatible with PostgreSQL 12+ and PGAdmin 4
-- =====================================================================

-- Drop existing tables in reverse dependency order (if clean reset needed)
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS property_status_history CASCADE;
-- DROP TABLE IF EXISTS property_views CASCADE;
-- DROP TABLE IF EXISTS property_enquiries CASCADE;
-- DROP TABLE IF EXISTS favorites CASCADE;
-- DROP TABLE IF EXISTS property_amenities CASCADE;
-- DROP TABLE IF EXISTS property_images CASCADE;
-- DROP TABLE IF EXISTS properties CASCADE;
-- DROP TABLE IF EXISTS amenities CASCADE;
-- DROP TABLE IF EXISTS localities CASCADE;
-- DROP TABLE IF EXISTS cities CASCADE;
-- DROP TABLE IF EXISTS states CASCADE;
-- DROP TABLE IF EXISTS property_types CASCADE;
-- DROP TABLE IF EXISTS agent_documents CASCADE;
-- DROP TABLE IF EXISTS agents CASCADE;
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS banners CASCADE;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin', 'super_admin')),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 3. AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_name VARCHAR(200),
    license_number VARCHAR(100),
    phone VARCHAR(30),
    whatsapp VARCHAR(30),
    bio TEXT,
    office_address TEXT,
    operating_cities TEXT,
    experience_years INTEGER DEFAULT 1,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AGENT DOCUMENTS TABLE (KYC / Verification)
CREATE TABLE IF NOT EXISTS agent_documents (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    doc_type VARCHAR(100) NOT NULL,
    doc_name VARCHAR(255),
    doc_url TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
    notes TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PROPERTY TYPES
CREATE TABLE IF NOT EXISTS property_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- 6. LOCATIONS: STATES, CITIES, LOCALITIES
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    UNIQUE (state_id, name)
);

CREATE TABLE IF NOT EXISTS localities (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    pincode VARCHAR(20)
);

-- 7. AMENITIES
CREATE TABLE IF NOT EXISTS amenities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    icon VARCHAR(50)
);

-- 8. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    ref_number VARCHAR(50) UNIQUE NOT NULL,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    property_type_id INTEGER NOT NULL REFERENCES property_types(id),
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    price_unit VARCHAR(30) DEFAULT 'total',
    land_area NUMERIC(10, 2),
    built_up_area NUMERIC(10, 2),
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking_spaces INTEGER DEFAULT 0,
    floor_no INTEGER,
    total_floors INTEGER,
    furnishing_status VARCHAR(50) DEFAULT 'unfurnished' CHECK (furnishing_status IN ('unfurnished', 'semi-furnished', 'fully-furnished')),
    facing VARCHAR(30),
    year_built INTEGER,
    address TEXT NOT NULL,
    locality VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    video_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'sold', 'rented', 'inactive')),
    approval_status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0,
    contact_preference VARCHAR(30) DEFAULT 'all' CHECK (contact_preference IN ('call', 'whatsapp', 'all')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. PROPERTY IMAGES
CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PROPERTY AMENITIES (Many-to-Many)
CREATE TABLE IF NOT EXISTS property_amenities (
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- 11. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, property_id)
);

-- 12. PROPERTY ENQUIRIES / LEADS CRM
CREATE TABLE IF NOT EXISTS property_enquiries (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    preferred_time VARCHAR(100),
    enquiry_type VARCHAR(30) DEFAULT 'enquiry' CHECK (enquiry_type IN ('enquiry', 'site_visit', 'callback', 'offer')),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'follow_up', 'closed', 'not_interested')),
    agent_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. PROPERTY VIEWS (Analytics)
CREATE TABLE IF NOT EXISTS property_views (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    viewer_ip VARCHAR(50),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. PROPERTY STATUS HISTORY (Audit Log)
CREATE TABLE IF NOT EXISTS property_status_history (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. BANNERS / ADS
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. COMPLAINTS & REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(150) NOT NULL,
    details TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Search, Performance & Filters
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status, approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_enquiries_agent ON property_enquiries(property_id, status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
