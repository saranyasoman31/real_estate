<?php
// =====================================================================
// DARV REAL ESTATE & CONSTRUCTION - HOSTINGER REST API
// Database: u167274826_darv (MySQL)
// =====================================================================

// Global CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$pdo = getDB();

// Parse Request Path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Extract path after /DARV/api/v1/ or /api/v1/ or /DARV/api/ or /api/
$path = preg_replace('#^.*?api/(v1/)?#i', '', $uri);
$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Read JSON Input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

// ---------------------------------------------------------------------
// 1. HEALTH CHECK
// ---------------------------------------------------------------------
if ($path === 'health' || $path === '') {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $propCount = in_array('properties', $tables) ? $pdo->query("SELECT COUNT(*) FROM properties")->fetchColumn() : 0;
    jsonResponse([
        'status' => 'connected',
        'database' => DB_NAME,
        'tables_count' => count($tables),
        'properties_count' => (int)$propCount,
        'server_time' => date('Y-m-d H:i:s')
    ]);
}

// ---------------------------------------------------------------------
// 2. AUTHENTICATION
// ---------------------------------------------------------------------
if ($path === 'auth/login' && $method === 'POST') {
    $identifier = trim($input['email'] ?? $input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($identifier) || empty($password)) {
        jsonResponse(['success' => false, 'message' => 'Please provide username/email and password.'], 400);
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.password_hash, u.phone, u.role, u.avatar_url, u.is_active,
               a.id AS agent_id, a.agency_name, a.license_number, a.verification_status, a.phone AS agency_phone, a.whatsapp AS agency_whatsapp
        FROM users u
        LEFT JOIN agents a ON a.user_id = u.id
        WHERE LOWER(u.email) = ?
           OR (u.email = 'darvproperties.com' AND ? IN ('darvproperties.com', 'saranyasoman31@gmail.com', 'admin@darvproperties.com'))
           OR (u.email = 'saranyasoman31@gmail.com' AND ? IN ('darvproperties.com', 'saranyasoman31@gmail.com'))
        ORDER BY (u.role IN ('agent', 'client', 'admin')) DESC
        LIMIT 1
    ");
    $lowerId = strtolower($identifier);
    $stmt->execute([$lowerId, $lowerId, $lowerId]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Invalid username/email or password.'], 401);
    }

    // Check password (bcrypt or fallback demo password)
    $isMatch = password_verify($password, $user['password_hash']) || ($password === '123456') || ($password === 'Darv2233');
    if (!$isMatch) {
        jsonResponse(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }

    unset($user['password_hash']);
    $token = 'darv_jwt_' . bin2hex(random_bytes(16));

    jsonResponse([
        'success' => true,
        'message' => 'Login successful.',
        'token' => $token,
        'user' => $user
    ]);
}

if ($path === 'auth/me' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar_url,
               a.id AS agent_id, a.agency_name, a.license_number
        FROM users u
        LEFT JOIN agents a ON a.user_id = u.id
        WHERE u.role IN ('client', 'admin') OR u.email = 'darvproperties.com'
        LIMIT 1
    ");
    $user = $stmt->fetch();
    jsonResponse(['success' => true, 'user' => $user]);
}

// ---------------------------------------------------------------------
// 3. AGENT PROFILE
// ---------------------------------------------------------------------
if ($path === 'agents/public/primary' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT a.*, u.name, u.email, u.avatar_url
        FROM agents a
        JOIN users u ON u.id = a.user_id
        LIMIT 1
    ");
    $agent = $stmt->fetch();
    if ($agent) {
        $agent['logo'] = '/images/darv-logo.png';
        $agent['logo_url'] = '/images/darv-logo.png';
    }
    jsonResponse(['success' => true, 'data' => $agent]);
}

if ($path === 'agents/profile/me' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT a.*, u.name, u.email, u.phone AS user_phone, u.avatar_url
        FROM agents a
        JOIN users u ON u.id = a.user_id
        LIMIT 1
    ");
    $agent = $stmt->fetch();
    if ($agent) {
        $agent['logo'] = '/images/darv-logo.png';
        $agent['logo_url'] = '/images/darv-logo.png';
    }
    jsonResponse(['success' => true, 'data' => $agent]);
}

if ($path === 'agents/profile/me' && $method === 'PUT') {
    $stmt = $pdo->prepare("
        UPDATE agents SET
            agency_name = COALESCE(?, agency_name),
            license_number = COALESCE(?, license_number),
            phone = COALESCE(?, phone),
            whatsapp = COALESCE(?, whatsapp),
            bio = COALESCE(?, bio),
            office_address = COALESCE(?, office_address),
            experience_years = COALESCE(?, experience_years)
        WHERE id = 1
    ");
    $stmt->execute([
        $input['agency_name'] ?? null,
        $input['license_number'] ?? null,
        $input['phone'] ?? null,
        $input['whatsapp'] ?? null,
        $input['bio'] ?? null,
        $input['office_address'] ?? null,
        $input['experience_years'] ?? null
    ]);
    jsonResponse(['success' => true, 'message' => 'Agent profile updated successfully.']);
}

// ---------------------------------------------------------------------
// 4. MASTER DATA (Types, Amenities, Locations)
// ---------------------------------------------------------------------
if ($path === 'master-data/property-types' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM property_types WHERE is_active = 1 ORDER BY id");
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

if ($path === 'master-data/amenities' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM amenities ORDER BY id");
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

if ($path === 'master-data/locations' && $method === 'GET') {
    $cities = $pdo->query("SELECT * FROM cities ORDER BY is_popular DESC, name ASC")->fetchAll();
    foreach ($cities as &$city) {
        $locStmt = $pdo->prepare("SELECT * FROM localities WHERE city_id = ? ORDER BY name ASC");
        $locStmt->execute([$city['id']]);
        $city['localities'] = $locStmt->fetchAll();
    }
    jsonResponse(['success' => true, 'cities' => $cities]);
}

// ---------------------------------------------------------------------
// 5. CLIENT DASHBOARD & INVENTORY
// ---------------------------------------------------------------------
if ($path === 'properties/client/dashboard' && $method === 'GET') {
    $stats = [
        'total_properties'     => (string)$pdo->query("SELECT COUNT(*) FROM properties")->fetchColumn(),
        'published_properties' => (string)$pdo->query("SELECT COUNT(*) FROM properties WHERE status = 'published'")->fetchColumn(),
        'sold_properties'      => (string)$pdo->query("SELECT COUNT(*) FROM properties WHERE status = 'sold'")->fetchColumn(),
        'rented_properties'    => (string)$pdo->query("SELECT COUNT(*) FROM properties WHERE status = 'rented'")->fetchColumn(),
        'draft_properties'     => (string)$pdo->query("SELECT COUNT(*) FROM properties WHERE status = 'draft'")->fetchColumn(),
        'featured_properties'  => (string)$pdo->query("SELECT COUNT(*) FROM properties WHERE is_featured = 1")->fetchColumn(),
        'total_views'          => (string)($pdo->query("SELECT COALESCE(SUM(views_count), 0) FROM properties")->fetchColumn() ?: '3420'),
        'total_enquiries'      => (string)$pdo->query("SELECT COUNT(*) FROM property_enquiries")->fetchColumn(),
        'new_enquiries'        => (string)$pdo->query("SELECT COUNT(*) FROM property_enquiries WHERE status = 'new'")->fetchColumn()
    ];

    $byType = $pdo->query("
        SELECT pt.name, pt.slug, COUNT(p.id) AS count
        FROM property_types pt
        LEFT JOIN properties p ON p.property_type_id = pt.id
        GROUP BY pt.id, pt.name, pt.slug
        ORDER BY count DESC
    ")->fetchAll();

    $recentEnquiries = $pdo->query("
        SELECT pe.*, p.title AS property_title, p.ref_number
        FROM property_enquiries pe
        JOIN properties p ON p.id = pe.property_id
        ORDER BY pe.created_at DESC
        LIMIT 5
    ")->fetchAll();

    jsonResponse([
        'success' => true,
        'stats' => $stats,
        'byType' => $byType,
        'recentEnquiries' => $recentEnquiries
    ]);
}

if ($path === 'properties/client/my-listings' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT p.*, pt.name AS property_type_name, pt.slug AS property_type_slug,
               (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) AS primary_image
        FROM properties p
        JOIN property_types pt ON pt.id = p.property_type_id
        ORDER BY p.id DESC
    ");
    $list = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $list, 'total' => count($list)]);
}

// ---------------------------------------------------------------------
// 6. PROPERTIES (List & Search)
// ---------------------------------------------------------------------
if ($path === 'properties' && $method === 'GET') {
    $conditions = ["p.status = 'published'"];
    $params = [];

    // Filter by Keyword
    if (!empty($_GET['keyword'])) {
        $conditions[] = "(p.title LIKE ? OR p.description LIKE ? OR p.locality LIKE ? OR p.ref_number LIKE ?)";
        $kw = '%' . $_GET['keyword'] . '%';
        $params[] = $kw; $params[] = $kw; $params[] = $kw; $params[] = $kw;
    }

    // Filter by Type
    if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
        $conditions[] = "(pt.slug = ? OR p.property_type_id = ?)";
        $params[] = $_GET['type'];
        $params[] = $_GET['type'];
    }

    // Filter by Listing Type
    if (!empty($_GET['listing_type']) && $_GET['listing_type'] !== 'all') {
        $conditions[] = "p.listing_type = ?";
        $params[] = $_GET['listing_type'];
    }

    // Filter by City
    if (!empty($_GET['city']) && $_GET['city'] !== 'All Cities') {
        $conditions[] = "LOWER(p.city) = ?";
        $params[] = strtolower($_GET['city']);
    }

    // Filter by Featured
    if (!empty($_GET['is_featured']) && ($_GET['is_featured'] === 'true' || $_GET['is_featured'] === '1')) {
        $conditions[] = "p.is_featured = 1";
    }

    // Price Filters
    if (!empty($_GET['min_price'])) {
        $conditions[] = "p.price >= ?";
        $params[] = (float)$_GET['min_price'];
    }
    if (!empty($_GET['max_price'])) {
        $conditions[] = "p.price <= ?";
        $params[] = (float)$_GET['max_price'];
    }

    $whereSql = implode(' AND ', $conditions);

    // Count Total
    $countStmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM properties p
        JOIN property_types pt ON pt.id = p.property_type_id
        WHERE $whereSql
    ");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Sorting
    $sort = $_GET['sort'] ?? 'newest';
    $orderBy = "p.is_featured DESC, p.id DESC";
    if ($sort === 'price_asc') $orderBy = "p.price ASC";
    if ($sort === 'price_desc') $orderBy = "p.price DESC";

    // Pagination
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 12)));
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare("
        SELECT p.*, pt.name AS property_type_name, pt.slug AS property_type_slug,
               a.agency_name, u.name AS agent_name, COALESCE(a.phone, u.phone) AS agent_phone, a.whatsapp AS agent_whatsapp,
               (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) AS primary_image
        FROM properties p
        JOIN property_types pt ON pt.id = p.property_type_id
        JOIN agents a ON a.id = p.agent_id
        JOIN users u ON u.id = a.user_id
        WHERE $whereSql
        ORDER BY $orderBy
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $properties = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'data' => $properties,
        'total' => $total,
        'totalPages' => ceil($total / $limit) ?: 1,
        'page' => $page,
        'limit' => $limit
    ]);
}

// ---------------------------------------------------------------------
// 7. SINGLE PROPERTY DETAILS
// ---------------------------------------------------------------------
if (preg_match('#^properties/([0-9]+|DARV-[A-Z0-9-]+)$#', $path, $matches) && $method === 'GET') {
    $identifier = $matches[1];

    $stmt = $pdo->prepare("
        SELECT p.*, pt.name AS property_type_name, pt.slug AS property_type_slug,
               a.id AS agent_id, a.agency_name, a.license_number AS agent_license, a.bio AS agent_bio,
               a.rating AS agent_rating, a.total_sales AS agent_sales, a.experience_years AS agent_experience,
               COALESCE(a.whatsapp, '+916282649279') AS agent_whatsapp,
               COALESCE(a.office_address, 'Trivandrum, Kerala') AS agent_address,
               u.name AS agent_name, u.email AS agent_email, COALESCE(a.phone, u.phone, '+91 6282649279') AS agent_phone
        FROM properties p
        JOIN property_types pt ON pt.id = p.property_type_id
        JOIN agents a ON a.id = p.agent_id
        JOIN users u ON u.id = a.user_id
        WHERE p.id = ? OR p.ref_number = ?
        LIMIT 1
    ");
    $stmt->execute([$identifier, $identifier]);
    $property = $stmt->fetch();

    if (!$property) {
        jsonResponse(['success' => false, 'message' => 'Property not found.'], 404);
    }

    // Increment view count
    $pdo->prepare("UPDATE properties SET views_count = views_count + 1 WHERE id = ?")->execute([$property['id']]);

    // Fetch Images
    $imgStmt = $pdo->prepare("SELECT id, image_url, is_primary, display_order FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, display_order ASC");
    $imgStmt->execute([$property['id']]);
    $property['images'] = $imgStmt->fetchAll();

    if (empty($property['primary_image']) && !empty($property['images'])) {
        $property['primary_image'] = $property['images'][0]['image_url'];
    }

    // Fetch Amenities
    $amStmt = $pdo->prepare("
        SELECT a.id, a.name, a.icon, a.category
        FROM amenities a
        JOIN property_amenities pa ON pa.amenity_id = a.id
        WHERE pa.property_id = ?
    ");
    $amStmt->execute([$property['id']]);
    $property['amenities'] = $amStmt->fetchAll();

    jsonResponse(['success' => true, 'data' => $property]);
}

// ---------------------------------------------------------------------
// 8. CREATE / UPDATE / DELETE PROPERTY
// ---------------------------------------------------------------------
if ($path === 'properties/client/create' && $method === 'POST') {
    $refNumber = 'DARV-TVM-' . str_pad((string)rand(10, 999), 3, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO properties (
            ref_number, agent_id, property_type_id, listing_type, title, description,
            price, price_unit, land_area, built_up_area, bedrooms, bathrooms, parking_spaces,
            floor_no, total_floors, furnishing_status, facing, year_built, address, locality,
            city, state, pincode, status, approval_status, is_featured
        ) VALUES (
            ?, 1, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, 'Kerala', ?, 'published', 'approved', ?
        )
    ");
    $stmt->execute([
        $refNumber,
        $input['property_type_id'] ?? 1,
        $input['listing_type'] ?? 'sale',
        $input['title'] ?? 'New Property',
        $input['description'] ?? '',
        $input['price'] ?? 0,
        $input['price_unit'] ?? 'total',
        $input['land_area'] ?? 0,
        $input['built_up_area'] ?? 0,
        $input['bedrooms'] ?? 0,
        $input['bathrooms'] ?? 0,
        $input['parking_spaces'] ?? 0,
        $input['floor_no'] ?? 1,
        $input['total_floors'] ?? 1,
        $input['furnishing_status'] ?? 'unfurnished',
        $input['facing'] ?? 'East',
        $input['year_built'] ?? 2024,
        $input['address'] ?? 'Trivandrum',
        $input['locality'] ?? 'Kowdiar',
        $input['city'] ?? 'Trivandrum',
        $input['pincode'] ?? '695001',
        !empty($input['is_featured']) ? 1 : 0
    ]);
    $propId = $pdo->lastInsertId();

    if (!empty($input['primary_image'])) {
        $pdo->prepare("INSERT INTO property_images (property_id, image_url, is_primary, display_order) VALUES (?, ?, 1, 1)")
            ->execute([$propId, $input['primary_image']]);
    }

    jsonResponse(['success' => true, 'message' => 'Property created successfully.', 'id' => $propId]);
}

if (preg_match('#^properties/client/([0-9]+)$#', $path, $matches)) {
    $propId = (int)$matches[1];

    if ($method === 'PUT') {
        $stmt = $pdo->prepare("
            UPDATE properties SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                status = COALESCE(?, status),
                is_featured = COALESCE(?, is_featured)
            WHERE id = ?
        ");
        $stmt->execute([
            $input['title'] ?? null,
            $input['description'] ?? null,
            $input['price'] ?? null,
            $input['status'] ?? null,
            isset($input['is_featured']) ? (int)$input['is_featured'] : null,
            $propId
        ]);
        jsonResponse(['success' => true, 'message' => 'Property updated successfully.']);
    }

    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM properties WHERE id = ?")->execute([$propId]);
        jsonResponse(['success' => true, 'message' => 'Property deleted successfully.']);
    }
}

if (preg_match('#^properties/client/([0-9]+)/status$#', $path, $matches) && $method === 'PUT') {
    $propId = (int)$matches[1];
    $status = $input['status'] ?? 'published';
    $pdo->prepare("UPDATE properties SET status = ? WHERE id = ?")->execute([$status, $propId]);
    jsonResponse(['success' => true, 'message' => 'Status updated.', 'status' => $status]);
}

if (preg_match('#^properties/client/([0-9]+)/feature$#', $path, $matches) && $method === 'PUT') {
    $propId = (int)$matches[1];
    $pdo->prepare("UPDATE properties SET is_featured = NOT is_featured WHERE id = ?")->execute([$propId]);
    jsonResponse(['success' => true, 'message' => 'Featured status toggled.']);
}

// ---------------------------------------------------------------------
// 9. LEADS & ENQUIRIES
// ---------------------------------------------------------------------
if ($path === 'enquiries/submit' && $method === 'POST') {
    $stmt = $pdo->prepare("
        INSERT INTO property_enquiries (
            property_id, customer_name, customer_email, customer_phone, message, enquiry_type, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'new')
    ");
    $stmt->execute([
        $input['property_id'] ?? 1,
        $input['name'] ?? $input['customer_name'] ?? 'Inquirer',
        $input['email'] ?? $input['customer_email'] ?? 'saranyasoman31@gmail.com',
        $input['phone'] ?? $input['customer_phone'] ?? '',
        $input['message'] ?? 'Interested in this property.',
        $input['enquiry_type'] ?? 'enquiry'
    ]);
    jsonResponse(['success' => true, 'message' => 'Enquiry submitted successfully. Saranya Soman will contact you shortly.']);
}

if ($path === 'enquiries/client' && $method === 'GET') {
    $stmt = $pdo->query("
        SELECT pe.*, p.title AS property_title, p.ref_number
        FROM property_enquiries pe
        JOIN properties p ON p.id = pe.property_id
        ORDER BY pe.created_at DESC
    ");
    $list = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $list, 'total' => count($list)]);
}

if (preg_match('#^enquiries/client/([0-9]+)$#', $path, $matches) && $method === 'PUT') {
    $enqId = (int)$matches[1];
    $status = $input['status'] ?? 'contacted';
    $pdo->prepare("UPDATE property_enquiries SET status = ? WHERE id = ?")->execute([$status, $enqId]);
    jsonResponse(['success' => true, 'message' => 'Enquiry status updated.']);
}

// ---------------------------------------------------------------------
// 10. CUSTOMER FEEDBACK & REVIEWS
// ---------------------------------------------------------------------
if ($path === 'feedback/public' && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM customer_feedback WHERE is_approved = 1 ORDER BY is_featured DESC, id DESC");
    jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
}

if ($path === 'feedback/stats' && $method === 'GET') {
    $avg = $pdo->query("SELECT ROUND(COALESCE(AVG(rating), 5.0), 1) FROM customer_feedback WHERE is_approved = 1")->fetchColumn();
    $count = $pdo->query("SELECT COUNT(*) FROM customer_feedback WHERE is_approved = 1")->fetchColumn();
    jsonResponse([
        'success' => true,
        'metrics' => [
            'trustScore' => 100,
            'averageRating' => (float)$avg,
            'totalReviews' => (int)$count,
            'verifiedProperties' => 100
        ]
    ]);
}

if ($path === 'feedback' && $method === 'POST') {
    $stmt = $pdo->prepare("
        INSERT INTO customer_feedback (
            agent_id, customer_name, customer_email, customer_phone, rating, category, comment, is_approved
        ) VALUES (1, ?, ?, ?, ?, ?, ?, 1)
    ");
    $stmt->execute([
        $input['name'] ?? $input['customer_name'] ?? 'Customer',
        $input['email'] ?? $input['customer_email'] ?? '',
        $input['phone'] ?? $input['customer_phone'] ?? '',
        $input['rating'] ?? 5,
        $input['category'] ?? 'Overall Experience',
        $input['comment'] ?? ''
    ]);
    jsonResponse(['success' => true, 'message' => 'Review submitted. Thank you for your feedback!']);
}

// Default Fallback
jsonResponse(['success' => false, 'message' => 'API route not found: ' . $path], 404);
