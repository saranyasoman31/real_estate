<?php
// =====================================================================
// DARV Real Estate - Hostinger Database Setup & Verification Page
// URL: https://soulmate4u.co.in/DARV/api/setup.php
// =====================================================================

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');

$error = null;
$success = false;
$tables = [];
$counts = [];

try {
    $pdo = getDB();

    // Check if SQL setup file exists
    $sqlFile = dirname(__DIR__) . '/darv_database_setup.sql';
    if (!file_exists($sqlFile)) {
        $sqlFile = __DIR__ . '/darv_database_setup.sql';
    }

    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        $pdo->exec($sql);
        $success = true;
    } else {
        $error = "Setup SQL file not found at: $sqlFile";
    }

    // Inspect created tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach (['users', 'agents', 'properties', 'property_types', 'amenities', 'property_enquiries', 'customer_feedback'] as $t) {
        if (in_array($t, $tables)) {
            $counts[$t] = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        }
    }
} catch (Exception $e) {
    $error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DARV Database Setup - Hostinger</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; padding: 30px; margin: 0; }
        .card { max-width: 650px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .logo { height: 48px; margin-bottom: 20px; }
        h1 { margin: 0 0 10px; font-size: 24px; color: #f59e0b; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 20px; }
        .badge-success { background: #065f46; color: #34d399; }
        .badge-error { background: #7f1d1d; color: #f87171; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
        .stat { background: #0f172a; padding: 14px; border-radius: 10px; border: 1px solid #334155; }
        .stat-num { font-size: 20px; font-weight: bold; color: #fbbf24; }
        .stat-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; }
        .btn { display: inline-block; padding: 12px 24px; background: #d97706; color: #fff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: 20px; }
        .btn:hover { background: #b45309; }
        pre { background: #0f172a; padding: 14px; border-radius: 8px; font-size: 12px; overflow-x: auto; color: #cbd5e1; }
    </style>
</head>
<body>
    <div class="card">
        <img src="../images/darv-logo.png" alt="DARV Logo" class="logo" onerror="this.style.display='none'">
        <h1>DARV Database Setup</h1>
        
        <?php if ($success): ?>
            <span class="badge badge-success">✓ Database Connected & Initialized</span>
            <p style="font-size: 14px; color: #94a3b8;">
                Your Hostinger MySQL database <strong><?php echo htmlspecialchars(DB_NAME); ?></strong> is connected and all tables have been successfully created and populated.
            </p>

            <div class="grid">
                <div class="stat">
                    <div class="stat-num"><?php echo count($tables); ?></div>
                    <div class="stat-label">Database Tables</div>
                </div>
                <div class="stat">
                    <div class="stat-num"><?php echo $counts['properties'] ?? 0; ?></div>
                    <div class="stat-label">Properties Seeded</div>
                </div>
                <div class="stat">
                    <div class="stat-num"><?php echo $counts['users'] ?? 0; ?></div>
                    <div class="stat-label">Users Registered</div>
                </div>
                <div class="stat">
                    <div class="stat-num"><?php echo $counts['amenities'] ?? 0; ?></div>
                    <div class="stat-label">Master Amenities</div>
                </div>
            </div>

            <p style="font-size: 13px; color: #cbd5e1;">
                Primary Agent: <strong>Saranya Soman</strong> (<code>darvproperties.com</code>)<br>
                Database Host: <code><?php echo htmlspecialchars(DB_HOST); ?></code><br>
                Database User: <code><?php echo htmlspecialchars(DB_USER); ?></code>
            </p>

            <a href="../admin" class="btn">Go to Agent Management Portal →</a>
            <a href="../" class="btn" style="background: #334155; margin-left: 10px;">View Website →</a>

        <?php else: ?>
            <span class="badge badge-error">✕ Setup Notice</span>
            <p style="color: #fca5a5; font-size: 14px;"><?php echo htmlspecialchars($error); ?></p>
            <p style="color: #94a3b8; font-size: 12px;">You can also import <code>darv_database_setup.sql</code> directly in Hostinger phpMyAdmin.</p>
        <?php endif; ?>
    </div>
</body>
</html>
