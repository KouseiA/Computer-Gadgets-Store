<?php
// api/users.php
require_once 'db.php';

header('Content-Type: application/json');

// Handle creating a new user (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate
        if (empty($input['username']) || empty($input['email']) || empty($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $username = $input['username'];
        $email = $input['email'];
        $password = $input['password']; // In a real app, hash this! e.g. password_hash($input['password'], PASSWORD_DEFAULT)
        $role = isset($input['role']) ? $input['role'] : 'customer';

        // Check availability
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
             http_response_code(409);
             echo json_encode(['error' => 'Username or Email already exists']);
             exit;
        }

        // Insert
        $sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username, $email, $password, $role]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// Handle deleting a user (DELETE)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $username = isset($_GET['username']) ? $_GET['username'] : null;

        if (!$id && !$username) {
            http_response_code(400);
            echo json_encode(['error' => 'ID or Username required']);
            exit;
        }

        if ($id) {
             $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
             $stmt->execute([$id]);
        } else {
             $stmt = $pdo->prepare("DELETE FROM users WHERE username = ?");
             $stmt->execute([$username]);
        }

        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// Handle listing users (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();
        echo json_encode($users);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>
