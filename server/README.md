# Server Mailer (PHP + SMTP)

This folder is isolated from frontend logic and is safe to enable when you are ready.

## Files
- `send-mail.php`: API endpoint for enquiry form
- `config.php`: reads server `.env`
- `smtp_mailer.php`: SMTP sender (TLS/SSL)
- `.env.example`: sample environment variables

## Setup
1. Copy `.env.example` to `.env` inside `server/`.
2. Fill SMTP credentials.
3. Deploy on PHP-enabled hosting.
4. Point frontend fetch endpoint to `/server/send-mail.php` when ready.

## Notes
- Keep `server/.env` out of git.
- This setup keeps SMTP credentials server-side only.
