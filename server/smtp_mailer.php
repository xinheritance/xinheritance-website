<?php

declare(strict_types=1);

function smtpRead($socket): string
{
    $response = '';
    while (($line = fgets($socket, 1024)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] !== '-') {
            break;
        }
    }
    return $response;
}

function smtpExpect(string $response, array $allowedCodes): void
{
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $allowedCodes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($response));
    }
}

function smtpCommand($socket, string $command, array $allowedCodes): string
{
    fwrite($socket, $command . "\r\n");
    $response = smtpRead($socket);
    smtpExpect($response, $allowedCodes);
    return $response;
}

function smtpSendMail(array $config, array $message): bool
{
    $host = (string)$config['smtp_host'];
    $port = (int)$config['smtp_port'];
    $secure = (string)$config['smtp_secure'];
    $username = (string)$config['smtp_username'];
    $password = (string)$config['smtp_password'];

    $transport = ($secure === 'ssl') ? 'ssl://' . $host : $host;
    $socket = stream_socket_client(
        $transport . ':' . $port,
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT
    );

    if ($socket === false) {
        throw new RuntimeException('SMTP connect failed: ' . $errstr);
    }

    stream_set_timeout($socket, 15);

    try {
        smtpExpect(smtpRead($socket), [220]);

        $domain = $_SERVER['SERVER_NAME'] ?? 'localhost';
        smtpCommand($socket, 'EHLO ' . $domain, [250]);

        if ($secure === 'tls') {
            smtpCommand($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Unable to enable TLS.');
            }
            smtpCommand($socket, 'EHLO ' . $domain, [250]);
        }

        smtpCommand($socket, 'AUTH LOGIN', [334]);
        smtpCommand($socket, base64_encode($username), [334]);
        smtpCommand($socket, base64_encode($password), [235]);

        smtpCommand($socket, 'MAIL FROM:<' . $message['from_email'] . '>', [250]);
        smtpCommand($socket, 'RCPT TO:<' . $message['to_email'] . '>', [250, 251]);
        smtpCommand($socket, 'DATA', [354]);

        $headers = [
            'From: ' . $message['from_name'] . ' <' . $message['from_email'] . '>',
            'Reply-To: ' . $message['reply_to'],
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit'
        ];

        $payload = 'Subject: ' . $message['subject'] . "\r\n";
        $payload .= implode("\r\n", $headers) . "\r\n\r\n";
        $payload .= $message['body'] . "\r\n.\r\n";

        fwrite($socket, $payload);
        smtpExpect(smtpRead($socket), [250]);
        smtpCommand($socket, 'QUIT', [221]);

        fclose($socket);
        return true;
    } catch (Throwable $error) {
        fclose($socket);
        throw $error;
    }
}
