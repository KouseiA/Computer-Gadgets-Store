<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        handlePost($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGet($pdo)
{
    // Return logs joined with product name
    try {
        $sql = "SELECT i.*, p.name as product_name 
                FROM inventory_logs i 
                JOIN products p ON i.product_id = p.id 
                ORDER BY i.created_at DESC LIMIT 100";
        $stmt = $pdo->query($sql);
        $logs = $stmt->fetchAll();
        echo json_encode($logs);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handlePost($pdo)
{
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['product_id']) || !isset($data['type']) || !isset($data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Product, Type (IN/OUT), and Quantity are required']);
        return;
    }

    $productId = $data['product_id'];
    $type = strtoupper($data['type']);
    $qty = (int) $data['quantity'];
    $reason = $data['reason'] ?? '';

    if ($qty <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Quantity must be positive']);
        return;
    }

    try {
        $pdo->beginTransaction();

        // 1. Log transaction
        $stmt = $pdo->prepare("INSERT INTO inventory_logs (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)");
        $stmt->execute([$productId, $type, $qty, $reason]);

        // 2. Update Product Stock
        if ($type === 'IN') {
            $updateSql = "UPDATE products SET stock = stock + ? WHERE id = ?";
        } elseif ($type === 'OUT') {
            // Optional: Check if stock sufficient? For now, allow negative stock (backorder) or 0 check if strictly enforcing.
            // Let's enforce 0 check just in case.
            $stmtCheck = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
            $stmtCheck->execute([$productId]);
            $currentStock = $stmtCheck->fetchColumn();

            if ($currentStock < $qty) {
                throw new Exception("Insufficient stock. Current: $currentStock");
            }

            $updateSql = "UPDATE products SET stock = stock - ? WHERE id = ?";
        } else {
            throw new Exception("Invalid Type. Must be IN or OUT.");
        }

        $stmtUpdate = $pdo->prepare($updateSql);
        $stmtUpdate->execute([$qty, $productId]);

        $pdo->commit();
        echo json_encode(['message' => 'Stock updated successfully']);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(400); // Bad Request for logic errors
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>