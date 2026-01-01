<?php
// api/login.php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and Password are required']);
            exit;
        }

        // Check for user (username OR email)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        if ($user) {
            // Verify Password
            // If using plain text (legacy/simple):
            if ($password === $user['password']) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'email' => $user['email'],
                        'role' => $user['role']
                    ]
                ]);
                exit;
            }
            // If using hashing (recommended):
            // if (password_verify($password, $user['password'])) { ... }
        }

        // --- Demo Account Fallback (Optional, for smooth dev experience) ---
        // If the DB is empty or Admin missing, allow default Admin login and create it?
        // For now, let's keep it potential, but better to return standard invalid creds.

        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
?>