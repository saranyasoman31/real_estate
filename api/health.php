<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $userCount = 0;
    $propCount = 0;
    if (in_array('users', $tables)) {
        $userCount = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    }
    if (in_array('properties', $tables)) {
        $propCount = $pdo->query("SELECT COUNT(*) FROM properties")->fetchColumn();
    }

    jsonResponse([
        'status' => 'connected',
        'database' => DB_NAME,
        'host' => DB_HOST,
        'user' => DB_USER,
        'tables_count' => count($tables),
        'tables' => $tables,
        'users_count' => (int)$userCount,
        'properties_count' => (int)$propCount,
        'server_time' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    jsonResponse([
        'status' => 'error',
        'message' => $e->getMessage()
    ], 500);
}
