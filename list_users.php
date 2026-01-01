<?php
// list_users.php
require_once 'api/db.php';

try {
    $stmt = $pdo->query("SELECT id, username, email, role FROM users");
    $users = $stmt->fetchAll();

    echo "Count: " . count($users) . "\n";
    foreach ($users as $u) {
        echo "[{$u['id']}] {$u['username']} ({$u['role']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>