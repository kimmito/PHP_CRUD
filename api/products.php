<?php
require 'cors.php';
require 'config.php';
require 'auth.php';
header('Content-Type: application/json');

requireRole($conn, ['admin']);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT p.*, d.name AS department_name FROM products p LEFT JOIN departments d ON p.department_id = d.id ORDER BY p.id DESC";
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
        $name = $input['name'] ?? '';
        $supplier = $input['supplier'] ?? '';
        $retail_price = $input['retail_price'] ?? 0.0;
        $arrival_date = $input['arrival_date'] ?? date('Y-m-d');
        $department_id = $input['department_id'] ?? 0;

        if (!validateStringRequired($name, 150)) {
            badRequest('Invalid or missing product name');
        }
        if (!validateStringOptional($supplier, 100)) {
            badRequest('Invalid supplier');
        }
        if (!validateFloat($retail_price, 0.0)) {
            badRequest('Invalid retail_price');
        }
        if (!validateDateYmd($arrival_date)) {
            badRequest('Invalid arrival_date (expected YYYY-MM-DD)');
        }
        if (!validateInt($department_id, 0)) {
            badRequest('Invalid department_id');
        }

        $stmt = $conn->prepare("INSERT INTO products (name, supplier, retail_price, arrival_date, department_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssdsi", $name, $supplier, $retail_price, $arrival_date, $department_id);
        
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
        $name = $input['name'] ?? '';
        $supplier = $input['supplier'] ?? '';
        $retail_price = $input['retail_price'] ?? 0.0;
        $arrival_date = $input['arrival_date'] ?? date('Y-m-d');
        $department_id = $input['department_id'] ?? 0;

        if (!validateInt($id, 1)) {
            badRequest('Invalid ID');
        }
        if (!validateStringRequired($name, 150)) {
            badRequest('Invalid or missing product name');
        }
        if (!validateStringOptional($supplier, 100)) {
            badRequest('Invalid supplier');
        }
        if (!validateFloat($retail_price, 0.0)) {
            badRequest('Invalid retail_price');
        }
        if (!validateDateYmd($arrival_date)) {
            badRequest('Invalid arrival_date (expected YYYY-MM-DD)');
        }
        if (!validateInt($department_id, 0)) {
            badRequest('Invalid department_id');
        }

        $stmt = $conn->prepare("UPDATE products SET name=?, supplier=?, retail_price=?, arrival_date=?, department_id=? WHERE id=?");
        $stmt->bind_param("ssdsii", $name, $supplier, $retail_price, $arrival_date, $department_id, $id);
        
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
        $checkStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM sales WHERE product_id=?");
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['cnt'] > 0) {
            echo json_encode(["status" => "error", "message" => "Нельзя удалить товар: есть связанные продажи."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
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
