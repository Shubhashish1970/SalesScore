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

## Troubleshooting "Failed to send email" (500)

1. **RESEND_API_KEY** – Add it in GitHub Secrets (Settings → Secrets → Actions). Redeploy after adding.
2. **Email must match exactly** – Use `shubhashish@nacl.murugappa.com` (not `.cor` or other typos).
3. **Resend account** – Create an account at [resend.com](https://resend.com), add an API key, and use it as `RESEND_API_KEY`.
4. **Check logs** – See "Where to find logs" below.

## Where to find logs

Logs are in **Google Cloud Logging** (not a local file). Each request logs a step-by-step trace with `[requestAdminLink]`.

**Option A – GCP Console (web):**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project `salesscore-c34f3` (or your Firebase project)
3. **Logging** → **Logs Explorer**
4. Filter: `textPayload=~"requestAdminLink"`
5. Or: **Cloud Functions** → **requestAdminLink** → **Logs** tab

**Option B – Export logs to a file (gcloud CLI):**
```bash
gcloud logging read 'textPayload=~"requestAdminLink"' \
  --project=salesscore-c34f3 --limit=50 --format=json > admin-request-logs.json
```

**Log steps:** `start` → `parse` → `send` → `success` or `resend_error` / `exception`. Share the JSON or screenshot of the failing step for analysis.
