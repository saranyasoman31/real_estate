<?php
// Hostinger MySQL Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'u167274826_darv');
define('DB_USER', 'u167274826_admin');
define('DB_PASS', 'Darv2233');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            // Check if tables are initialized; if not, auto-initialize
            ensureTablesExist($pdo);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    return $pdo;
}

function ensureTablesExist($pdo) {
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmt->rowCount() === 0) {
            // Tables not found, run setup
            require_once __DIR__ . '/setup_tables.php';
            runDatabaseSetup($pdo);
        }
    } catch (Exception $e) {
        // Continue silently if check fails
    }
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
