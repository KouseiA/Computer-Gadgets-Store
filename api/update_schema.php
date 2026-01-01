<?php
require_once 'db.php';

try {
    $sql = "ALTER TABLE orders 
            ADD COLUMN first_name VARCHAR(255) NULL,
            ADD COLUMN last_name VARCHAR(255) NULL,
            ADD COLUMN email VARCHAR(255) NULL,
            ADD COLUMN phone VARCHAR(50) NULL,
            ADD COLUMN address TEXT NULL,
            ADD COLUMN barangay VARCHAR(255) NULL,
            ADD COLUMN city VARCHAR(255) NULL,
            ADD COLUMN province VARCHAR(255) NULL,
            ADD COLUMN postal_code VARCHAR(20) NULL";

    $pdo->exec($sql);
    echo "Schema updated successfully: Added customer columns to orders table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Table already has these columns.";
    } else {
        echo "Error updating schema: " . $e->getMessage();
    }
}
?>