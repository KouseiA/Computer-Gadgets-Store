<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['order_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing order_id or status"]);
    exit;
}

$order_id = $data['order_id'];
// Deal with "ORD-" prefix if present
if (strpos($order_id, 'ORD-') === 0) {
    $order_id = (int) substr($order_id, 4);
}

$status = $data['status'];

try {
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $order_id]);

    echo json_encode(["message" => "Order status updated successfully"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>