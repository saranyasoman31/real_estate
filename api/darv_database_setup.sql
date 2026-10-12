-- =====================================================================
-- DARV REAL ESTATE & CONSTRUCTION - HOSTINGER MYSQL DATABASE SETUP
-- Database Name: u167274826_darv
-- Generated: 2026-10-12
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `role` VARCHAR(30) NOT NULL DEFAULT 'customer',
    `avatar_url` TEXT DEFAULT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ROLES TABLE
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. AGENTS TABLE
CREATE TABLE IF NOT EXISTS `agents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `agency_name` VARCHAR(200) DEFAULT NULL,
    `license_number` VARCHAR(100) DEFAULT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `whatsapp` VARCHAR(30) DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `office_address` TEXT DEFAULT NULL,
    `operating_cities` TEXT DEFAULT NULL,
    `experience_years` INT DEFAULT 6,
    `verification_status` VARCHAR(30) NOT NULL DEFAULT 'verified',
    `rating` DECIMAL(3, 2) DEFAULT 5.00,
    `total_sales` INT DEFAULT 12,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PROPERTY TYPES TABLE
CREATE TABLE IF NOT EXISTS `property_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `icon` VARCHAR(100) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. STATES, CITIES & LOCALITIES
CREATE TABLE IF NOT EXISTS `states` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `code` VARCHAR(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `state_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `image_url` TEXT DEFAULT NULL,
    `is_popular` TINYINT(1) DEFAULT 1,
    FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uq_city_state` (`state_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `localities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `city_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `pincode` VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AMENITIES TABLE
CREATE TABLE IF NOT EXISTS `amenities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `category` VARCHAR(50) DEFAULT 'general',
    `icon` VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS `properties` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ref_number` VARCHAR(50) NOT NULL UNIQUE,
    `agent_id` INT NOT NULL,
    `property_type_id` INT NOT NULL,
    `listing_type` VARCHAR(20) NOT NULL DEFAULT 'sale',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `price_unit` VARCHAR(30) DEFAULT 'total',
    `land_area` DECIMAL(10, 2) DEFAULT 0,
    `built_up_area` DECIMAL(10, 2) DEFAULT 0,
    `bedrooms` INT DEFAULT 0,
    `bathrooms` INT DEFAULT 0,
    `parking_spaces` INT DEFAULT 0,
    `floor_no` INT DEFAULT 1,
    `total_floors` INT DEFAULT 1,
    `furnishing_status` VARCHAR(50) DEFAULT 'unfurnished',
    `facing` VARCHAR(30) DEFAULT NULL,
    `year_built` INT DEFAULT 2024,
    `address` TEXT NOT NULL,
    `locality` VARCHAR(150) DEFAULT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Trivandrum',
    `state` VARCHAR(100) NOT NULL DEFAULT 'Kerala',
    `pincode` VARCHAR(20) DEFAULT NULL,
    `latitude` DECIMAL(10, 7) DEFAULT NULL,
    `longitude` DECIMAL(10, 7) DEFAULT NULL,
    `video_url` TEXT DEFAULT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'published',
    `approval_status` VARCHAR(30) NOT NULL DEFAULT 'approved',
    `rejection_reason` TEXT DEFAULT NULL,
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
    `views_count` INT NOT NULL DEFAULT 0,
    `contact_preference` VARCHAR(30) DEFAULT 'all',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`property_type_id`) REFERENCES `property_types`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PROPERTY IMAGES TABLE
CREATE TABLE IF NOT EXISTS `property_images` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `property_id` INT NOT NULL,
    `image_url` TEXT NOT NULL,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. PROPERTY AMENITIES TABLE
CREATE TABLE IF NOT EXISTS `property_amenities` (
    `property_id` INT NOT NULL,
    `amenity_id` INT NOT NULL,
    PRIMARY KEY (`property_id`, `amenity_id`),
    FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. PROPERTY ENQUIRIES / LEADS TABLE
CREATE TABLE IF NOT EXISTS `property_enquiries` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `property_id` INT NOT NULL,
    `customer_id` INT DEFAULT NULL,
    `customer_name` VARCHAR(150) NOT NULL,
    `customer_email` VARCHAR(150) NOT NULL,
    `customer_phone` VARCHAR(30) NOT NULL,
    `message` TEXT NOT NULL,
    `preferred_time` VARCHAR(100) DEFAULT NULL,
    `enquiry_type` VARCHAR(30) DEFAULT 'enquiry',
    `status` VARCHAR(30) NOT NULL DEFAULT 'new',
    `agent_notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CUSTOMER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS `customer_feedback` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `agent_id` INT DEFAULT NULL,
    `user_id` INT DEFAULT NULL,
    `property_id` INT DEFAULT NULL,
    `customer_name` VARCHAR(150) NOT NULL,
    `customer_email` VARCHAR(150) NOT NULL,
    `customer_phone` VARCHAR(50) DEFAULT NULL,
    `rating` INT NOT NULL DEFAULT 5,
    `category` VARCHAR(100) DEFAULT 'Overall Experience',
    `feedback_title` VARCHAR(255) DEFAULT NULL,
    `comment` TEXT NOT NULL,
    `is_approved` TINYINT(1) DEFAULT 1,
    `is_featured` TINYINT(1) DEFAULT 1,
    `agent_reply` TEXT DEFAULT NULL,
    `agent_replied_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS `favorites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `property_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_user_fav` (`user_id`, `property_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- SEED INITIAL DATA: AGENT, TYPES, LOCATIONS, AMENITIES, PROPERTIES
-- =====================================================================

-- Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'customer', 'Customer discovering properties'),
(2, 'client', 'Agency owner and management console')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Primary Agent User: Saranya Soman (Password: 123456)
-- Bcrypt hash for 123456: $2a$10$w0954b/jD10R91e/7vD29egR.Qf4c57oE9Z3Lz459H/h80a1dJom.
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `role`, `avatar_url`, `is_active`) VALUES
(1, 'Saranya Soman', 'darvproperties.com', '$2a$10$w0954b/jD10R91e/7vD29egR.Qf4c57oE9Z3Lz459H/h80a1dJom.', '+91 6282649279', 'client', '/images/darv-icon.png', 1),
(2, 'Saranya Soman (Direct)', 'saranyasoman31@gmail.com', '$2a$10$w0954b/jD10R91e/7vD29egR.Qf4c57oE9Z3Lz459H/h80a1dJom.', '+91 6282649279', 'client', '/images/darv-icon.png', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password_hash` = VALUES(`password_hash`);

-- Primary Agent Profile
INSERT INTO `agents` (`id`, `user_id`, `agency_name`, `license_number`, `phone`, `whatsapp`, `bio`, `office_address`, `operating_cities`, `experience_years`, `verification_status`, `rating`, `total_sales`) VALUES
(1, 1, 'DARV Real Estate & Construction', 'K-RERA/PRJ/TVM/2026', '+91 6282649279', '+916282649279', 'Certified real estate property consultant specializing in premium residences, flats, and prime plots in Trivandrum.', 'DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003', 'Trivandrum', 6, 'verified', 5.00, 12)
ON DUPLICATE KEY UPDATE `agency_name` = VALUES(`agency_name`), `phone` = VALUES(`phone`), `whatsapp` = VALUES(`whatsapp`);

-- Property Types
INSERT INTO `property_types` (`id`, `name`, `slug`, `icon`, `description`, `is_active`) VALUES
(1, 'Apartment / Flat', 'apartment', 'Building2', 'High-rise residential apartments, studios, and penthouses', 1),
(2, 'Luxury Villa', 'villa', 'Home', 'Standalone private villas with gardens, gated luxury compounds', 1),
(3, 'Independent House', 'house', 'Warehouse', 'Stand-alone builder floors and independent bungalows', 1),
(4, 'Plot / Land', 'plot', 'Landmark', 'Approved residential, agricultural, and commercial layout plots', 1),
(5, 'Commercial Space', 'commercial', 'Briefcase', 'Office spaces, retail shops, tech park floors, and showrooms', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- State & City
INSERT INTO `states` (`id`, `name`, `code`) VALUES (1, 'Kerala', 'KL')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `cities` (`id`, `state_id`, `name`, `image_url`, `is_popular`) VALUES
(1, 1, 'Trivandrum', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `localities` (`id`, `city_id`, `name`, `pincode`) VALUES
(1, 1, 'Kowdiar', '695003'),
(2, 1, 'Sasthamangalam', '695010'),
(3, 1, 'Kazhakkoottam', '695582'),
(4, 1, 'Pattom', '695004'),
(5, 1, 'Vellayambalam', '695010'),
(6, 1, 'Vazhuthacaud', '695014'),
(7, 1, 'Akkulam', '695017')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Amenities
INSERT INTO `amenities` (`id`, `name`, `category`, `icon`) VALUES
(1, 'Swimming Pool', 'leisure', 'Waves'),
(2, 'Gymnasium & Fitness Center', 'wellness', 'Dumbbell'),
(3, '24/7 Security & CCTV', 'security', 'ShieldCheck'),
(4, 'Power Backup (100%)', 'utility', 'Zap'),
(5, 'Clubhouse & Party Hall', 'community', 'Users'),
(6, 'Covered Reserved Parking', 'parking', 'Car'),
(7, 'Children Play Area', 'leisure', 'Smile'),
(8, 'Landscaped Zen Gardens', 'outdoors', 'Trees'),
(9, 'High-Speed Elevators', 'convenience', 'ArrowUpDown'),
(10, 'EV Charging Stations', 'eco', 'BatteryCharging'),
(11, 'Piped Gas Connection', 'utility', 'Flame'),
(12, 'Rainwater Harvesting', 'eco', 'Droplets')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 8 Curated Properties
INSERT INTO `properties` (`id`, `ref_number`, `agent_id`, `property_type_id`, `listing_type`, `title`, `description`, `price`, `price_unit`, `land_area`, `built_up_area`, `bedrooms`, `bathrooms`, `parking_spaces`, `floor_no`, `total_floors`, `furnishing_status`, `facing`, `year_built`, `address`, `locality`, `city`, `state`, `pincode`, `status`, `approval_status`, `is_featured`, `views_count`) VALUES
(1, 'DARV-TVM-001', 1, 1, 'sale', 'The Kowdiar Crown - 4 BHK Ultra Luxury Penthouse', 'An architectural marvel in Trivandrum’s most prestigious royal avenue. Featuring panoramic skyline views, double-height ceilings, private terrace deck, imported Italian marble flooring, and smart home automation.', 26500000.00, 'total', 0, 3450, 4, 5, 2, 14, 16, 'fully-furnished', 'East', 2024, 'Palace View Avenue, Kowdiar Main Road', 'Kowdiar', 'Trivandrum', 'Kerala', '695003', 'published', 'approved', 1, 420),
(2, 'DARV-TVM-002', 1, 1, 'sale', 'Imperial Heights 3 BHK Sea-Breeze High-Rise Apartment', 'Sun-drenched, well-ventilated 3 BHK luxury residence situated minutes from the Lulu Mall & NH bypass corridor. Offers world-class clubhouse, infinity lap pool, and 2 designated covered parking slots.', 14500000.00, 'total', 0, 2150, 3, 3, 2, 8, 18, 'semi-furnished', 'North-East', 2023, 'Akkulam Bypass Road, near Lulu Mall', 'Akkulam', 'Trivandrum', 'Kerala', '695017', 'published', 'approved', 1, 315),
(3, 'DARV-TVM-003', 1, 2, 'sale', 'Palm Grove Luxury 4 BHK Garden Villa', 'Private gated oasis in serene Sasthamangalam. Architecturally planned with an internal courtyard, teakwood joinery, designer landscaped lawn, private plunge pool, and solar-powered utility system.', 21000000.00, 'total', 8.5, 3200, 4, 4, 2, 1, 2, 'fully-furnished', 'East', 2024, 'Pipinmoodu Lane, Sasthamangalam', 'Sasthamangalam', 'Trivandrum', 'Kerala', '695010', 'published', 'approved', 1, 510),
(4, 'DARV-TVM-004', 1, 1, 'sale', 'Technopark Boulevard Smart 2 BHK Executive Suite', 'Prime investment flat located right opposite Technopark Phase 3 main portal. High guaranteed rental yield, high-speed fiber connectivity, biometric door lock, fully furnished interior package.', 6200000.00, 'total', 0, 1180, 2, 2, 1, 5, 12, 'fully-furnished', 'West', 2024, 'Technopark Phase 3 Gate, Kazhakkoottam', 'Kazhakkoottam', 'Trivandrum', 'Kerala', '695582', 'published', 'approved', 0, 280),
(5, 'DARV-TVM-005', 1, 3, 'sale', 'Royal Heritage Traditional 4 BHK Courtyard Nalukettu', 'A harmonious fusion of traditional Kerala architecture and modern luxury conveniences. Features natural Athangudi tiles, an open Nadumuttam (skylight courtyard), carved teak pillars, and modular kitchen.', 18500000.00, 'total', 10.0, 2850, 4, 4, 2, 1, 2, 'semi-furnished', 'East', 2022, 'Marappalam Road, Pattom', 'Pattom', 'Trivandrum', 'Kerala', '695004', 'published', 'approved', 0, 195),
(6, 'DARV-TVM-006', 1, 5, 'sale', 'Skyline Corporate Pinnacle - Grade-A Commercial IT Floor', 'Expansive 5,600 sq.ft bare-shell commercial office floor located on main Vellayambalam-Vazhuthacaud commercial high street. 100% DG power backup, centralized HVAC ducting, 8 reserved basement parking spaces.', 42000000.00, 'total', 0, 5600, 0, 6, 8, 3, 7, 'unfurnished', 'North', 2023, 'Vellayambalam Junction', 'Vellayambalam', 'Trivandrum', 'Kerala', '695010', 'published', 'approved', 0, 160),
(7, 'DARV-TVM-007', 1, 4, 'sale', 'Sasthamangalam Prime 10 Cent Residential Villa Plot', 'Corner dry residential plot with 40-foot road frontage, peaceful elite neighborhood, complete clear titles with K-RERA approval and prior bank sanction from SBI & HDFC.', 11500000.00, 'total', 10.0, 0, 0, 0, 0, 0, 0, 'unfurnished', 'East', 2024, 'Officers Colony, Sasthamangalam', 'Sasthamangalam', 'Trivandrum', 'Kerala', '695010', 'published', 'approved', 0, 340),
(8, 'DARV-TVM-008', 1, 2, 'sale', 'Green Valley Contemporary 5 BHK Gated Estate Villa', 'Ultra-luxurious custom-built 5 BHK villa spanning 4,100 sq.ft on 12 cents in premier Vazhuthacaud. Boasts a private infinity plunge pool, double-height light-filled living salon, soundproof cinema suite, Italian kitchen, and servant quarters.', 32000000.00, 'total', 12.0, 4100, 5, 6, 3, 1, 3, 'fully-furnished', 'East', 2024, 'Cotton Hill Enclave, Vazhuthacaud', 'Vazhuthacaud', 'Trivandrum', 'Kerala', '695014', 'published', 'approved', 1, 670)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `price` = VALUES(`price`);

-- Property Images
INSERT INTO `property_images` (`property_id`, `image_url`, `is_primary`, `display_order`) VALUES
(1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 1, 1),
(1, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', 0, 2),
(2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 1, 1),
(2, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', 0, 2),
(3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 1, 1),
(4, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 1, 1),
(5, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', 1, 1),
(6, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 1, 1),
(7, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 1, 1),
(8, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 1, 1);

-- Property Amenities Links
INSERT IGNORE INTO `property_amenities` (`property_id`, `amenity_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3), (2, 6),
(3, 1), (3, 3), (3, 8), (3, 10),
(4, 3), (4, 4), (4, 9),
(5, 3), (5, 6), (5, 8),
(6, 3), (6, 4), (6, 6), (6, 9),
(7, 3),
(8, 1), (8, 2), (8, 3), (8, 8);

-- Customer Feedback / Testimonials
INSERT INTO `customer_feedback` (`customer_name`, `customer_email`, `customer_phone`, `rating`, `category`, `comment`, `is_approved`, `is_featured`, `agent_reply`) VALUES
('Vinod Krishnan', 'vinod.krishnan@gmail.com', '+91 98471 22334', 5, 'buyer', 'Exceptional service by Saranya Soman and DARV. Found our dream penthouse in Kowdiar within weeks with complete clear titles and legal verification.', 1, 1, 'Thank you Mr. Vinod! It was an absolute pleasure assisting you and your family in Kowdiar.'),
('Anjali Menon', 'anjali.m@technopark.org', '+91 94470 55667', 5, 'investor', 'Purchased a commercial space near Technopark Phase 3 through DARV. Highest level of professionalism, clear documentation, and transparent dealing.', 1, 1, 'Glad to assist you Anjali! The Technopark corridor is experiencing tremendous capital appreciation.'),
('Thomas Mathew', 'thomas.mathew@gulfmail.com', '+91 98950 11223', 5, 'buyer', 'As an NRI based in Dubai, purchasing a home in Trivandrum without being physically present seemed difficult. Saranya handled video walk-throughs, paperwork, and registration flawlessly.', 1, 1, 'Thank you Thomas sir! Delivering peace of mind to our NRI clients is our top priority.')
ON DUPLICATE KEY UPDATE `comment` = VALUES(`comment`);

-- Property Enquiries / Leads
INSERT INTO `property_enquiries` (`property_id`, `customer_name`, `customer_email`, `customer_phone`, `message`, `enquiry_type`, `status`) VALUES
(1, 'Dr. Vivek Nair', 'vivek.nair@kimshealth.org', '+91 94471 23456', 'Interested in site inspection this Saturday afternoon for Kowdiar Penthouse.', 'site_visit', 'new'),
(8, 'Meera Nambiar', 'meera.nambiar@ust.com', '+91 98950 87654', 'Requesting floor plans, bank approval details, and brochure on WhatsApp.', 'enquiry', 'contacted'),
(2, 'Rajesh Kumar', 'rajesh.k@infosys.com', '+91 98460 34567', 'What is the expected maintenance charge per month and possession date?', 'callback', 'follow_up')
ON DUPLICATE KEY UPDATE `message` = VALUES(`message`);
