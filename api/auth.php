<?php
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

const REMEMBER_COOKIE = 'trade_remember';
const REMEMBER_DAYS = 30;

function jsonResponse(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function publicUser(array $row): array
{
    return [
        'id' => (int)$row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'full_name' => $row['full_name'],
        'role' => $row['role'],
        'status' => $row['status'],
        'login_count' => (int)($row['login_count'] ?? 0),
        'previous_login_at' => $row['previous_login_at'] ?? null,
        'last_login_at' => $row['last_login_at'] ?? null,
    ];
}

function setSessionUser(array $row): void
{
    $_SESSION['user'] = publicUser($row);
}

function clearRememberCookie(): void
{
    setcookie(REMEMBER_COOKIE, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function issueRememberToken(mysqli $conn, int $userId): void
{
    $token = bin2hex(random_bytes(32));
    $hash = hash('sha256', $token);
    $expires = date('Y-m-d H:i:s', time() + REMEMBER_DAYS * 86400);

    $stmt = $conn->prepare('UPDATE users SET remember_token_hash=?, remember_expires_at=? WHERE id=?');
    $stmt->bind_param('ssi', $hash, $expires, $userId);
    $stmt->execute();
    $stmt->close();

    setcookie(REMEMBER_COOKIE, $userId . ':' . $token, [
        'expires' => time() + REMEMBER_DAYS * 86400,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clearRememberToken(mysqli $conn, ?int $userId): void
{
    if ($userId !== null) {
        $stmt = $conn->prepare('UPDATE users SET remember_token_hash=NULL, remember_expires_at=NULL WHERE id=?');
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $stmt->close();
    }
    clearRememberCookie();
}

function fetchUserById(mysqli $conn, int $userId): ?array
{
    $stmt = $conn->prepare('SELECT * FROM users WHERE id=? LIMIT 1');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc() ?: null;
    $stmt->close();
    return $user;
}

function markLogin(mysqli $conn, array $user): array
{
    $userId = (int)$user['id'];
    $previousLogin = $user['last_login_at'];
    $loginCount = (int)$user['login_count'] + 1;

    $stmt = $conn->prepare('UPDATE users SET previous_login_at=?, last_login_at=NOW(), login_count=? WHERE id=?');
    $stmt->bind_param('sii', $previousLogin, $loginCount, $userId);
    $stmt->execute();
    $stmt->close();

    $user['previous_login_at'] = $previousLogin;
    $user['login_count'] = $loginCount;
    $user['last_login_at'] = date('Y-m-d H:i:s');
    return $user;
}

function loginUser(mysqli $conn, array $user, bool $remember): array
{
    session_regenerate_id(true);
    $freshUser = markLogin($conn, $user);
    setSessionUser($freshUser);

    if ($remember) {
        issueRememberToken($conn, (int)$freshUser['id']);
    } else {
        clearRememberToken($conn, (int)$freshUser['id']);
    }

    return $_SESSION['user'];
}

function restoreRememberedUser(mysqli $conn): void
{
    if (isset($_SESSION['user']) || empty($_COOKIE[REMEMBER_COOKIE])) {
        return;
    }

    $parts = explode(':', $_COOKIE[REMEMBER_COOKIE], 2);
    if (count($parts) !== 2 || !ctype_digit($parts[0])) {
        clearRememberCookie();
        return;
    }

    $user = fetchUserById($conn, (int)$parts[0]);
    if (!$user || $user['status'] !== 'approved' || empty($user['remember_token_hash']) || empty($user['remember_expires_at'])) {
        clearRememberCookie();
        return;
    }

    if (strtotime($user['remember_expires_at']) < time()) {
        clearRememberToken($conn, (int)$user['id']);
        return;
    }

    if (!hash_equals($user['remember_token_hash'], hash('sha256', $parts[1]))) {
        clearRememberToken($conn, (int)$user['id']);
        return;
    }

    loginUser($conn, $user, true);
}

function currentUser(mysqli $conn): ?array
{
    restoreRememberedUser($conn);
    return $_SESSION['user'] ?? null;
}

function requireAuth(mysqli $conn): array
{
    $user = currentUser($conn);
    if (!$user) {
        jsonResponse(['status' => 'error', 'message' => 'Требуется авторизация'], 401);
    }
    if ($user['status'] !== 'approved') {
        jsonResponse(['status' => 'error', 'message' => 'Учетная запись ожидает одобрения администратора'], 403);
    }
    return $user;
}

function requireRole(mysqli $conn, array $roles): array
{
    $user = requireAuth($conn);
    if (!in_array($user['role'], $roles, true)) {
        jsonResponse(['status' => 'error', 'message' => 'Недостаточно прав для доступа к данному разделу'], 403);
    }
    return $user;
}
?>
