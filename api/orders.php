<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once 'db.php';

if (!isset($_GET['user_id'])) {
    echo json_encode(["error" => "User ID is required"]);
    exit;
}

$user_id = intval($_GET['user_id']);

try {
    // Fetch orders
    $stmt = $pdo->prepare("SELECT id, created_at as date, status, total, courier, shipping_fee FROM orders WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll();

    $result = [];

    foreach ($orders as $order) {
        // Fetch items for each order
        $stmtItems = $pdo->prepare("SELECT product_name, quantity, price, subtotal FROM order_items WHERE order_id = ?");
        $stmtItems->execute([$order['id']]);
        $items = $stmtItems->fetchAll();

        $order['items'] = $items;
        $result[] = $order;
    }

    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>