# SECURITY & SECRET ROTATION

Use this guide to rotate and validate secrets for the backend safely.

## Generate secure JWT secrets

Run the generator script to obtain secure secrets (local machine):

```powershell
cd backend
node generate-secrets.js
```

Copy the output and replace the `JWT_SECRET` and `JWT_REFRESH_SECRET` env vars in your DigitalOcean App Platform config. Do NOT commit or paste these values in code.

## Validate env on startup
The backend runs a validation function on startup to check some required secrets and their minimum length. If the environment fails validation in `NODE_ENV=production`, the process will exit to avoid running with insecure configuration.

## Revoking refresh tokens
After rotating secrets in DigitalOcean, run the following command to invalidate all refresh tokens and force users to login again:

```powershell
cd backend
npm run revoke:refresh-tokens
```

This script will clear the `refreshTokens` property for all users in the database. It is safe but will require users to re-login.

## Post-rotation steps
1. Redeploy your app on DigitalOcean (or wait for automatic redeploy) after updating env vars.
2. Run `npm run revoke:refresh-tokens` to clear refresh tokens.
3. Smoke test login and token flows.

## Database backups check
Ensure managed database backups are enabled in DigitalOcean:

1. Open the DO Control Panel > Databases > Select your DB (Postgres).
2. Click 'Backups' and verify daily snapshots are enabled and the retention policy matches your needs.
3. Optionally, run a restore on a staging DB to validate backup integrity.

## Additional checks
- Verify `ALLOW_ALL_CORS` is set to `0` in production and `VITE_FRONTEND_URL` is correct.
- Ensure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, and other critical secrets are present and not logged.
