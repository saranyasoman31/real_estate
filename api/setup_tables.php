<?php
// Auto Database Setup Script for Hostinger MySQL Database

function runDatabaseSetup($pdo) {
    $sqlFile = dirname(__DIR__) . '/darv_database_setup.sql';
    if (!file_exists($sqlFile)) {
        $sqlFile = __DIR__ . '/darv_database_setup.sql';
    }

    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        // Execute multi-query
        $pdo->exec($sql);
        return true;
    }

    return false;
}
