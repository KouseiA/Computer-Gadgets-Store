<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db.php';

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid input data"]);
    exit;
}

// Validate required fields
if (!isset($data['customer']) || !isset($data['items']) || !isset($data['total'])) {
    echo json_encode(["error" => "Missing required order fields"]);
    exit;
}

$customer = $data['customer'];
$shipping = $data['shipping'];
$payment = $data['payment'];
$items = $data['items'];
$total = floatval($data['total']);
$courier = isset($data['courier']) ? $data['courier'] : 'Standard';
$shipping_fee = isset($data['shippingFee']) ? floatval($data['shippingFee']) : 150.00;

// Since we don't have a logged-in user session in this context (it seems to be a guest checkout or client-side storage based),
// we will just store the customer info in a JSON blob or just ignore user_id for now if not logged in.
// However, the database schema has `user_id`. For now, we'll assume NULL or 0 for guest.
$user_id = isset($data['userId']) ? intval($data['userId']) : NULL;

try {
    $pdo->beginTransaction();

    // 1. Insert into orders table
    // Note: The database.sql doesn't currently store full customer address separate from user_id, 
    // but for a robust system we should. Since I can't easily change the schema significantly without migration issues,
    // I will stick to what I added: courier and shipping_fee. 
    // I'll assume customer details are handled on the client or I should add columns for them.
    // Given the task, I'll stick to the requested changes. 
    // *Correction*: To be useful, I should probably save the customer details. 
    // But let's look at `orders` table again. It only has `user_id`. 
    // This implies `users` table holds the info. But guest checkout?
    // I will act as a generic backend that trusts the `user_id` if provided, else null.
    // For the purpose of "Courier Choice", ensuring that saves is the priority.

    // 1. Insert into orders table
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total, status, courier, shipping_fee, first_name, last_name, email, phone, address, barangay, city, province, postal_code) VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $user_id,
        $total,
        $courier,
        $shipping_fee,
        $customer['firstName'],
        $customer['lastName'],
        $customer['email'],
        $customer['phone'],
        $shipping['address'],
        $shipping['barangay'],
        $shipping['city'],
        $shipping['province'],
        $shipping['postalCode']
    ]);
    $order_id = $pdo->lastInsertId();

    // 2. Insert into order_items table
    $stmtItems = $pdo->prepare("INSERT INTO order_items (order_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)");

    foreach ($items as $item) {
        $price = floatval(preg_replace('/[^\d.]/', '', $item['price'])); // Clean price string
        $qty = intval($item['qty']);
        $subtotal = $price * $qty;

        $stmtItems->execute([$order_id, $item['title'], $price, $qty, $subtotal]);

        // 3. Decrement Stock
        // Note: Using product_name to match since we don't have product_id in the cart items (based on provided code).
        // Ideally should match by ID.
        $stmtStock = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE name = ? AND stock >= ?");
        $stmtStock->execute([$qty, $item['title'], $qty]);

        if ($stmtStock->rowCount() === 0) {
            throw new Exception("Insufficient stock for product: " . $item['title']);
        }
    }

    $pdo->commit();

    // --- Send Email Receipt ---
    try {
        require_once 'email_service.php';

        $emailItems = [];
        foreach ($items as $item) {
            $price = floatval(preg_replace('/[^\d.]/', '', $item['price']));
            $qty = intval($item['qty']);
            $emailItems[] = [
                'product_name' => $item['title'],
                'quantity' => $qty,
                'price' => $price,
                'subtotal' => $price * $qty
            ];
        }

        $orderDataForEmail = [
            'first_name' => $customer['firstName'],
            'last_name' => $customer['lastName'],
            'email' => $customer['email'],
            'address' => $shipping['address'] . ', ' . $shipping['barangay'],
            'city' => $shipping['city'],
            'province' => $shipping['province'],
            'zip' => $shipping['postalCode'],
            'payment_method' => $payment['method'],
            'shipping_fee' => $shipping_fee,
            'courier' => $courier,
            'total' => $total
        ];

        sendOrderReceipt($orderDataForEmail, $emailItems);
    } catch (Exception $e) {
        // Silently log email error but don't fail the order response
        error_log("Email Receipt Failed: " . $e->getMessage());
    }
    // --------------------------

    echo json_encode([
        "message" => "Order placed successfully",
        "orderId" => $order_id,
        "courier" => $courier,
        "total" => $total
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode(["error" => "Order placement failed: " . $e->getMessage()]);
}
?>