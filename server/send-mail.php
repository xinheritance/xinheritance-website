<?php

declare(strict_types=1);

ini_set('display_errors', '0');
ob_start();

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

function jsonResponse(int $statusCode, array $payload): void
{
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (ob_get_length()) {
        ob_clean();
    }
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['ok' => false, 'error' => 'Method not allowed']);
}

$raw = file_get_contents('php://input');
$data = json_decode((string)$raw, true);

if (!is_array($data)) {
    jsonResponse(400, ['ok' => false, 'error' => 'Invalid JSON']);
}

$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$interest = trim((string)($data['interest'] ?? 'General'));
$message = trim((string)($data['message'] ?? ''));
$honeypot = trim((string)($data['company_website'] ?? ''));

if ($honeypot !== '') {
    jsonResponse(200, ['ok' => true]);
}

if ($name === '' || $email === '' || $message === '') {
    jsonResponse(422, ['ok' => false, 'error' => 'Missing required fields']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(422, ['ok' => false, 'error' => 'Invalid email']);
}

$requiredConfig = [
    'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
    'smtp_from_email', 'smtp_from_name', 'smtp_to_email', 'smtp_secure'
];

foreach ($requiredConfig as $key) {
    if (empty($config[$key])) {
        jsonResponse(500, ['ok' => false, 'error' => 'Server mail config missing: ' . $key]);
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

    jsonResponse(200, ['ok' => true]);
} catch (Throwable $error) {
    error_log('send-mail.php error: ' . $error->getMessage());
    jsonResponse(500, ['ok' => false, 'error' => 'Unable to send email']);
}
