<?php
require 'cors.php';
require 'config.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM departments ORDER BY id DESC";
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
        $boss_name = $input['boss_name'] ?? '';
        $phone = $input['phone'] ?? '';
        $floor = $input['floor'] ?? 0;
        
        $stmt = $conn->prepare("INSERT INTO departments (name, boss_name, phone, floor) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $name, $boss_name, $phone, $floor);
        
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
        $boss_name = $input['boss_name'] ?? '';
        $phone = $input['phone'] ?? '';
        $floor = $input['floor'] ?? 0;

        $stmt = $conn->prepare("UPDATE departments SET name=?, boss_name=?, phone=?, floor=? WHERE id=?");
        $stmt->bind_param("sssii", $name, $boss_name, $phone, $floor, $id);
        
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
        $checkStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM products WHERE department_id=?");
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        if ($row['cnt'] > 0) {
            echo json_encode(["status" => "error", "message" => "Нельзя удалить отдел: к нему привязаны товары."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM departments WHERE id=?");
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