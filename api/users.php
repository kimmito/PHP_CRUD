<?php
require 'cors.php';
require 'config.php';
require 'auth.php';
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'me';
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

function normalizeInput(string $value): string
{
    return trim($value);
}

function validateRegistration(array $input): array
{
    $errors = [];
    $username = normalizeInput((string)($input['username'] ?? ''));
    $email = normalizeInput((string)($input['email'] ?? ''));
    $fullName = normalizeInput((string)($input['full_name'] ?? ''));
    $password = (string)($input['password'] ?? '');

    if ($username === '' || mb_strlen($username) < 3 || mb_strlen($username) > 50 || !preg_match('/^[A-Za-z0-9_.-]+$/', $username)) {
        $errors['username'] = 'Логин должен содержать 3-50 латинских символов, цифр или знаков _.-';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
        $errors['email'] = 'Введите корректный e-mail';
    }
    if ($fullName === '' || mb_strlen($fullName) < 3 || mb_strlen($fullName) > 150) {
        $errors['full_name'] = 'Введите ФИО длиной от 3 до 150 символов';
    }
    if (mb_strlen($password) < 8 || mb_strlen($password) > 72) {
        $errors['password'] = 'Пароль должен содержать от 8 до 72 символов';
    }

    return [$errors, $username, $email, $fullName, $password];
}

if ($method === 'GET' && $action === 'me') {
    $user = currentUser($conn);
    jsonResponse(['status' => 'success', 'user' => $user]);
}

if ($method === 'POST' && $action === 'register') {
    [$errors, $username, $email, $fullName, $password] = validateRegistration($input);
    if ($errors) {
        jsonResponse(['status' => 'error', 'message' => 'Проверьте данные формы', 'errors' => $errors], 422);
    }

    $stmt = $conn->prepare('SELECT id FROM users WHERE username=? OR email=? LIMIT 1');
    $stmt->bind_param('ss', $username, $email);
    $stmt->execute();
    $exists = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($exists) {
        jsonResponse(['status' => 'error', 'message' => 'Пользователь с таким логином или e-mail уже существует'], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'guest';
    $status = 'pending';
    $stmt = $conn->prepare('INSERT INTO users (username, email, full_name, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('ssssss', $username, $email, $fullName, $passwordHash, $role, $status);
    $stmt->execute();
    $stmt->close();

    jsonResponse(['status' => 'success', 'message' => 'Заявка на регистрацию отправлена администратору']);
}

if ($method === 'POST' && $action === 'login') {
    $login = normalizeInput((string)($input['login'] ?? ''));
    $password = (string)($input['password'] ?? '');
    $remember = !empty($input['remember']);

    if ($login === '' || $password === '') {
        jsonResponse(['status' => 'error', 'message' => 'Введите логин/e-mail и пароль'], 422);
    }

    $stmt = $conn->prepare('SELECT * FROM users WHERE username=? OR email=? LIMIT 1');
    $stmt->bind_param('ss', $login, $login);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['status' => 'error', 'message' => 'Неверный логин или пароль'], 401);
    }
    if ($user['status'] !== 'approved') {
        jsonResponse(['status' => 'error', 'message' => 'Учетная запись ожидает одобрения администратора'], 403);
    }

    $sessionUser = loginUser($conn, $user, $remember);
    jsonResponse(['status' => 'success', 'user' => $sessionUser]);
}

if ($method === 'POST' && $action === 'logout') {
    $userId = isset($_SESSION['user']['id']) ? (int)$_SESSION['user']['id'] : null;
    clearRememberToken($conn, $userId);
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
    }
    session_destroy();
    jsonResponse(['status' => 'success']);
}

if ($method === 'GET' && ($action === 'pending' || $action === 'all')) {
    requireRole($conn, ['admin']);
    $where = $action === 'pending' ? "WHERE status='pending'" : '';
    $result = $conn->query("SELECT id, username, email, full_name, role, status, login_count, previous_login_at, last_login_at, created_at FROM users {$where} ORDER BY created_at DESC");
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    jsonResponse(['status' => 'success', 'users' => $users]);
}

if ($method === 'POST' && $action === 'approve') {
    requireRole($conn, ['admin']);
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        badRequest('Invalid user id');
    }
    $role = in_array(($input['role'] ?? 'operator'), ['operator', 'admin'], true) ? $input['role'] : 'operator';
    $status = 'approved';
    $stmt = $conn->prepare('UPDATE users SET role=?, status=? WHERE id=?');
    $stmt->bind_param('ssi', $role, $status, $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(['status' => 'success']);
}

if ($method === 'POST' && $action === 'reject') {
    requireRole($conn, ['admin']);
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        badRequest('Invalid user id');
    }
    $role = 'guest';
    $status = 'rejected';
    $stmt = $conn->prepare('UPDATE users SET role=?, status=?, remember_token_hash=NULL, remember_expires_at=NULL WHERE id=?');
    $stmt->bind_param('ssi', $role, $status, $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(['status' => 'success']);
}

if ($method === 'PUT' && $action === 'user') {
    requireRole($conn, ['admin']);
    $id = intval($_GET['id'] ?? 0);
    $username = normalizeInput((string)($input['username'] ?? ''));
    $email = normalizeInput((string)($input['email'] ?? ''));
    $fullName = normalizeInput((string)($input['full_name'] ?? ''));
    $role = (string)($input['role'] ?? 'guest');
    $status = (string)($input['status'] ?? 'pending');

    if ($id <= 0 || $username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $fullName === '') {
        jsonResponse(['status' => 'error', 'message' => 'Проверьте обязательные поля'], 422);
    }
    if (!in_array($role, ['guest', 'operator', 'admin'], true) || !in_array($status, ['pending', 'approved', 'rejected'], true)) {
        jsonResponse(['status' => 'error', 'message' => 'Некорректная роль или статус'], 422);
    }

    $stmt = $conn->prepare('UPDATE users SET username=?, email=?, full_name=?, role=?, status=? WHERE id=?');
    $stmt->bind_param('sssssi', $username, $email, $fullName, $role, $status, $id);
    $stmt->execute();
    $stmt->close();
    jsonResponse(['status' => 'success']);
}

jsonResponse(['status' => 'error', 'message' => 'Неподдерживаемое действие'], 404);
?>
