-- Production Performance Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);

CREATE INDEX IF NOT EXISTS idx_enquiries_prop ON property_enquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON property_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON property_enquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_images_prop ON property_images(property_id, display_order);
CREATE INDEX IF NOT EXISTS idx_amenities_prop ON property_amenities(property_id, amenity_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, property_id);
