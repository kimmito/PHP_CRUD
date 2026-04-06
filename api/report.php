<?php
require 'cors.php';
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $month = $_GET['month'] ?? date('m');
    $year = $_GET['year'] ?? date('Y');

    $sql = "SELECT
                d.id AS department_id,
                d.name AS department_name,
                p.id AS product_id,
                p.name AS product_name,
                COALESCE(s.retail_price, p.retail_price) AS retail_price,
                SUM(s.quantity) AS total_quantity,
                SUM(COALESCE(s.retail_price, p.retail_price) * s.quantity) AS total_revenue
            FROM sales s
            JOIN products p ON s.product_id = p.id
            JOIN departments d ON p.department_id = d.id
            WHERE MONTH(s.sale_date) = ? AND YEAR(s.sale_date) = ?
            GROUP BY d.id, d.name, p.id, p.name, COALESCE(s.retail_price, p.retail_price)
            ORDER BY d.name ASC, p.name ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $month, $year);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rows = [];
    $total_sum = 0.0;
    
    while ($row = $result->fetch_assoc()) {
        $row['retail_price'] = (float)$row['retail_price'];
        $row['total_quantity'] = (int)$row['total_quantity'];
        $row['total_revenue'] = (float)$row['total_revenue'];
        $rows[] = $row;
        $total_sum += $row['total_revenue'];
    }
    
    echo json_encode([
        "month" => (int)$month,
        "year" => (int)$year,
        "rows" => $rows,
        "total_sum" => round($total_sum, 2)
    ]);
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Неподдерживаемый метод запроса"]);
}

$conn->close();
?>