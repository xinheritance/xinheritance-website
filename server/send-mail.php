<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/smtp_mailer.php';

$config = serverConfig();

header('Content-Type: application/json; charset=UTF-8');
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', (string)$config['allowed_origin'])));
$isLocalDevOrigin = preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $requestOrigin) === 1;

if ($requestOrigin !== '' && ($isLocalDevOrigin || in_array($requestOrigin, $allowedOrigins, true))) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode((string)$raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$interest = trim((string)($data['interest'] ?? 'General'));
$message = trim((string)($data['message'] ?? ''));
$honeypot = trim((string)($data['company_website'] ?? ''));

if ($honeypot !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

if ($name === '' || $email === '' || $message === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Invalid email']);
    exit;
}

$requiredConfig = [
    'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
    'smtp_from_email', 'smtp_from_name', 'smtp_to_email', 'smtp_secure'
];

foreach ($requiredConfig as $key) {
    if (empty($config[$key])) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Server mail config missing: ' . $key]);
        exit;
    }
}

$subject = 'New Enquiry from xinheritance.com';
$body = "Name: {$name}\n" .
        "Email: {$email}\n" .
        "Interest: {$interest}\n\n" .
        "Message:\n{$message}\n";

try {
    smtpSendMail($config, [
        'from_email' => (string)$config['smtp_from_email'],
        'from_name' => (string)$config['smtp_from_name'],
        'to_email' => (string)$config['smtp_to_email'],
        'reply_to' => $email,
        'subject' => $subject,
        'body' => $body,
    ]);

    echo json_encode(['ok' => true]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Unable to send email']);
}
