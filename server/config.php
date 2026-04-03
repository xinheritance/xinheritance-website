<?php

declare(strict_types=1);

function loadEnv(string $filePath): array
{
    if (!is_file($filePath)) {
        return [];
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    $env = [];
    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $parts = explode('=', $trimmed, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $value = trim($value, "\"'");
        $env[$key] = $value;
    }

    return $env;
}

function envValue(string $key, array $env, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }

    if (isset($env[$key]) && $env[$key] !== '') {
        return $env[$key];
    }

    return $default;
}

function serverConfig(): array
{
    $env = loadEnv(__DIR__ . '/.env');

    return [
        'allowed_origin' => envValue('ALLOWED_ORIGIN', $env, ''),
        'smtp_host' => envValue('SMTP_HOST', $env, ''),
        'smtp_port' => (int)envValue('SMTP_PORT', $env, '587'),
        'smtp_username' => envValue('SMTP_USERNAME', $env, ''),
        'smtp_password' => envValue('SMTP_PASSWORD', $env, ''),
        'smtp_from_email' => envValue('SMTP_FROM_EMAIL', $env, ''),
        'smtp_from_name' => envValue('SMTP_FROM_NAME', $env, 'Xinheritance Website'),
        'smtp_to_email' => envValue('SMTP_TO_EMAIL', $env, ''),
        'smtp_secure' => strtolower((string)envValue('SMTP_SECURE', $env, 'tls')),
    ];
}
