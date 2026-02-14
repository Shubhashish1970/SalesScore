# Admin Access

Admin configuration is **only** accessible via a link sent to **shubhashish@nacl.murugappa.com**. Direct URL access (e.g. `?mobile=1234567890`) has been removed.

## Flow

1. **Request admin link** – Visit `https://salesscore-c34f3.web.app/admin/request` and enter your email.
2. **Email check** – If the email matches `shubhashish@nacl.murugappa.com`, an admin link is sent to that address.
3. **Access** – Open the link in the email to reach the Admin Settings screen (link expires in 24 hours).

## Request Page

**URL:** `https://salesscore-c34f3.web.app/admin/request`

Enter your email and click **Send Admin Link**. If the email is authorized, you will receive the admin configuration link by email.

## Setup (Resend)

The `requestAdminLink` Cloud Function uses [Resend](https://resend.com) to send emails. Configure:

1. Create a [Resend](https://resend.com) account and get an API key.
2. Add **`RESEND_API_KEY`** to Firebase Functions env (or GitHub Secrets for CI deploy).
3. For production, verify your domain in Resend and set **`RESEND_FROM_EMAIL`** (e.g. `Sales Scorecard <admin@yourdomain.com>`). Default: `onboarding@resend.dev` (Resend test sender).

## Manual Link Generation (fallback)

Run from the project root:

```bash
node scripts/generate-admin-link.js
```

This prints a URL like `https://salesscore-c34f3.web.app/?token=<jwt>`.

## Security

- The app decodes the JWT and checks `email === "shubhashish@nacl.murugappa.com"`.
- The link expires after 24 hours.
