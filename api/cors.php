<?php
$allowedOrigin = $_ENV['CORS_ALLOW_ORIGIN'] ?? $_SERVER['CORS_ALLOW_ORIGIN'] ?? getenv('CORS_ALLOW_ORIGIN') ?: '';
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$origin = $allowedOrigin !== '' && $allowedOrigin !== '*' ? $allowedOrigin : ($requestOrigin ?: '*');

header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
