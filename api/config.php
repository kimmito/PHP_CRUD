<?php
function loadEnvFile(string $path): void
{
    if (!is_file($path) || !is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $pair = explode('=', $line, 2);
        if (count($pair) !== 2) {
            continue;
        }

        $key = trim($pair[0]);
        $value = trim($pair[1]);

        if ($key === '') {
            continue;
        }

        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }

        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
        putenv("{$key}={$value}");
    }
}

function envValue(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }
    return (string)$value;
}

loadEnvFile(__DIR__ . '/.env');

$host = envValue('DB_HOST', 'localhost');
$user = envValue('DB_USER', 'root');
$pass = envValue('DB_PASS', '');
$db = envValue('DB_NAME', 'TradeDB');

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["error" => "Ошибка подключения к базе данных: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

function badRequest(string $msg): void
{
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $msg]);
    exit;
}

function validateStringRequired($val, int $max = 255): bool
{
    if (!is_string($val)) return false;
    $v = trim($val);
    return $v !== '' && mb_strlen($v) <= $max;
}

function validateStringOptional($val, int $max = 255): bool
{
    if ($val === null) return true;
    if ($val === '') return true;
    return is_string($val) && mb_strlen(trim($val)) <= $max;
}

function validateInt($val, ?int $min = null, ?int $max = null): bool
{
    if (!is_numeric($val)) return false;
    $i = intval($val);
    if ($min !== null && $i < $min) return false;
    if ($max !== null && $i > $max) return false;
    return true;
}

function validateFloat($val, ?float $min = null): bool
{
    if (!is_numeric($val)) return false;
    $f = (float)$val;
    if ($min !== null && $f < $min) return false;
    return true;
}

function validateDateYmd($val): bool
{
    if (!is_string($val)) return false;
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $val)) return false;
    [$y, $m, $d] = explode('-', $val);
    return checkdate((int)$m, (int)$d, (int)$y);
}
?>