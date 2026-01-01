<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once 'db.php';

try {
    // Fetch all orders
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($orders as $order) {
        // Fetch items for each order
        $stmtItems = $pdo->prepare("SELECT product_name as title, quantity as qty, price, subtotal FROM order_items WHERE order_id = ?");
        $stmtItems->execute([$order['id']]);
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        // Structure similar to what the frontend expects
        $orderData = [
            'id' => 'ORD-' . str_pad($order['id'], 6, '0', STR_PAD_LEFT), // Format ID
            'raw_id' => $order['id'], // Keep raw ID for updates
            'date' => $order['created_at'],
            'status' => $order['status'],
            'total' => $order['total'],
            'courier' => $order['courier'],
            'shippingFee' => $order['shipping_fee'],
            'customer' => [
                'firstName' => $order['first_name'],
                'lastName' => $order['last_name'],
                'email' => $order['email'],
                'phone' => $order['phone']
            ],
            'shipping' => [
                'address' => $order['address'],
                'barangay' => $order['barangay'],
                'city' => $order['city'],
                'province' => $order['province'],
                'postalCode' => $order['postal_code']
            ],
            'items' => $items
        ];

        $result[] = $orderData;
    }

    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>