# Gemini commentary API (GCP Cloud Functions)

This folder is deployed to **Google Cloud Functions (Gen2)** as an HTTP-triggered function. It accepts a scorecard JSON body and returns Gemini-generated commentary.

## Deploy from GitHub

1. **Secrets** (repo → Settings → Secrets and variables → Actions):
   - **`GEMINI_API_KEY`** — Gemini API key (required for the function to work).
   - **`FIREBASE_SERVICE_ACCOUNT_JSON`** — GCP service account key JSON with roles: **Cloud Functions Developer**, **Service Account User** (same key as Firebase deploy is fine if it has these roles).
   - **`FIREBASE_PROJECT_ID`** — e.g. `salesscore-c34f3` (optional if you use the default in the workflow).

2. **Trigger deploy:**
   - Push a change under `gcp-gemini-api/` or run **Actions → Deploy Gemini API (GCP) → Run workflow**.

3. **URL:** After a successful run, the function is at:
   `https://us-central1-<PROJECT_ID>.cloudfunctions.net/gemini-commentary`

The main app’s Firebase build sets `NEXT_PUBLIC_GEMINI_COMMENTARY_URL` to this URL so the deployed scorecard app uses the function automatically.

## Local test

```bash
cd gcp-gemini-api
npm install
# Run via Cloud Functions Framework or invoke with a test body:
# curl -X POST -H "Content-Type: application/json" -d @../src/data/sampleScorecard.json https://us-central1-salesscore-c34f3.cloudfunctions.net/gemini-commentary
```

## Env (on GCP)

The workflow passes **`GEMINI_API_KEY`** into the function’s environment. You can also set or override it in **GCP Console → Cloud Functions → gemini-commentary → Edit → Environment variables**.
