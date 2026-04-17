<?php
require 'cors.php';
require 'config.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT
                    s.id,
                    s.product_id,
                    s.quantity,
                    s.sale_date,
                    p.name AS product_name,
                    COALESCE(s.retail_price, p.retail_price) AS retail_price
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                ORDER BY s.id DESC";
        $result = $conn->query($sql);
        $data = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $product_id = $input['product_id'] ?? 0;
        $quantity = $input['quantity'] ?? 0;
        $retail_price = isset($input['retail_price']) && $input['retail_price'] !== ''
            ? (float)$input['retail_price']
            : null;
        $sale_date = $input['sale_date'] ?? ($input['date'] ?? date('Y-m-d'));

        if (!validateInt($product_id, 1)) {
            badRequest('Invalid product_id');
        }
        if (!validateInt($quantity, 1)) {
            badRequest('Invalid quantity');
        }
        if ($retail_price !== null && !validateFloat($retail_price, 0.0)) {
            badRequest('Invalid retail_price');
        }
        if (!validateDateYmd($sale_date)) {
            badRequest('Invalid sale_date (expected YYYY-MM-DD)');
        }

        $stmt = $conn->prepare("INSERT INTO sales (product_id, quantity, retail_price, sale_date) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iids", $product_id, $quantity, $retail_price, $sale_date);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($_GET['id'])) {
            echo json_encode(["status" => "error", "message" => "Не передан ID"]);
            exit;
        }
        $id = intval($_GET['id']);
        $product_id = $input['product_id'] ?? 0;
        $quantity = $input['quantity'] ?? 0;
        $retail_price = isset($input['retail_price']) && $input['retail_price'] !== ''
            ? (float)$input['retail_price']
            : null;
        $sale_date = $input['sale_date'] ?? ($input['date'] ?? date('Y-m-d'));

        if (!validateInt($id, 1)) {
            badRequest('Invalid ID');
        }
        if (!validateInt($product_id, 1)) {
            badRequest('Invalid product_id');
        }
        if (!validateInt($quantity, 1)) {
            badRequest('Invalid quantity');
        }
        if ($retail_price !== null && !validateFloat($retail_price, 0.0)) {
            badRequest('Invalid retail_price');
        }
        if (!validateDateYmd($sale_date)) {
            badRequest('Invalid sale_date (expected YYYY-MM-DD)');
        }

        $stmt = $conn->prepare("UPDATE sales SET product_id=?, quantity=?, retail_price=?, sale_date=? WHERE id=?");
        $stmt->bind_param("iidsi", $product_id, $quantity, $retail_price, $sale_date, $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(["status" => "error", "message" => "Не передан ID"]);
            exit;
        }
        $id = intval($_GET['id']);
        $stmt = $conn->prepare("DELETE FROM sales WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Неподдерживаемый метод запроса"]);
        break;
}

$conn->close();
?>