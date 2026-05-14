<?php
require 'cors.php';
require 'config.php';
require 'auth.php';
header('Content-Type: application/json');

requireRole($conn, ['admin', 'operator']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT DISTINCT YEAR(sale_date) AS year, MONTH(sale_date) AS month FROM sales ORDER BY year DESC, month ASC";
    $result = $conn->query($sql);
    
    $dates = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $dates[] = [
                "year" => (int)$row['year'],
                "month" => (int)$row['month']
            ];
        }
    }
    
    echo json_encode(["status" => "success", "dates" => $dates]);
} else {
    echo json_encode(["status" => "error", "message" => "Неподдерживаемый метод запроса"]);
}

$conn->close();
?>