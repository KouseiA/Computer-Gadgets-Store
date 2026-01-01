<?php
// api/products.php
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        handlePost($pdo);
        break;
    case 'DELETE':
        handleDelete($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGet($pdo)
{
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        echo json_encode($products);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handlePost($pdo)
{
    // Check if it's a multipart form data (File Upload)
    // $_POST will contain text fields, $_FILES will contain the image

    $name = $_POST['name'] ?? null;
    $price = $_POST['price'] ?? null;

    if (!$name || !$price) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields (name, price)']);
        return;
    }

    $imagePath = '../IMAGES/AULA F2088 Pro.jpg'; // Default fallback

    // Handle File Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../assets/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileTmpPath = $_FILES['image']['tmp_name'];
        $fileName = $_FILES['image']['name'];
        $fileSize = $_FILES['image']['size'];
        $fileType = $_FILES['image']['type'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        // Sanitize filename
        $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
        $dest_path = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            $imagePath = $dest_path;
        } else {
            // If upload fails, maybe return error or stick to default?
            // Let's log it and stick to default for now to avoid crash
            error_log("File upload failed for " . $fileName);
        }
    }

    $sql = "INSERT INTO products (name, category, brand, price, image, description, stock) VALUES (:name, :category, :brand, :price, :image, :description, :stock)";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => $name,
            ':category' => $_POST['category'] ?? '',
            ':brand' => $_POST['brand'] ?? 'AULA',
            ':price' => $price,
            ':image' => $imagePath,
            ':description' => $_POST['description'] ?? '',
            ':stock' => $_POST['stock'] ?? 0
        ]);

        echo json_encode(['message' => 'Product created', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handleDelete($pdo)
{
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        return;
    }

    $id = $_GET['id'];

    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Product deleted']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>