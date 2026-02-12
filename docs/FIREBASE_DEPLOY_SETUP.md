# Deploy Sales Scorecard to Firebase — Setup Guide

Use this guide to enable GitHub Actions → Firebase Hosting deploy. You only need **Option A** (recommended).

---

## What you need

- A **Firebase project** (you already have `salesscore-c34f3` in `.firebaserc`).
- **GitHub repo** with the Sales Scorecard code and the workflow at `.github/workflows/deploy-firebase.yml`.
- **One GitHub secret**: the contents of a Firebase/GCP service account key JSON (Option A).

---

## Option A (recommended): Service account key in GitHub Secrets

### Step 1: Open Firebase / GCP

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your project **salesscore-c34f3** (or your actual project).
3. Click the **gear icon** → **Project settings**.

### Step 2: Create a service account key for CI

1. In Project settings, open the **Service accounts** tab.
2. Click **Generate new private key** (or “Add member” / use existing service account — see Step 3 if you prefer a dedicated CI account).
3. Confirm. A JSON file will download. **Keep it secure**; treat it like a password.
4. You will use the **entire contents** of this JSON file in Step 4.

**Alternative (dedicated CI account):**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and select the **same** project (salesscore-c34f3).
2. Go to **IAM & Admin** → **Service Accounts**.
3. Click **Create Service Account**.
4. Name it e.g. `github-actions-firebase-deploy`, then **Create and Continue**.
5. Under “Grant this service account access to project”, add role **Firebase Hosting Admin** (or **Editor** if you prefer). Then **Done**.
6. Open the new service account → **Keys** → **Add key** → **Create new key** → **JSON** → **Create**. Save the downloaded JSON; you’ll use its contents in Step 4.

### Step 3: Enable APIs (if needed)

- In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Enabled APIs**, ensure **Firebase Hosting API** is enabled (it usually is when you use Firebase Hosting).
- If you use a new service account, no extra APIs are required beyond what Firebase already enables.

### Step 4: Add GitHub secret

1. Open your **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. **Name:** `FIREBASE_SERVICE_ACCOUNT_JSON`
4. **Value:** Paste the **entire** contents of the JSON key file (from Step 2). One line or pretty-printed both work.
5. Click **Add secret**.

The workflow uses **`FIREBASE_SERVICE_ACCOUNT_JSON`** for authentication. You do not need `FIREBASE_TOKEN` (deprecated; tokens expire). Optional: **`FIREBASE_PROJECT_ID`** (default `salesscore-c34f3`).

**KPI Data API (optional):** Add secret **`KPI_DATA_API_URL`** with value `https://kw-sales-score-api-366769154420.asia-south1.run.app/api/scorecard`. The app uses a same-origin proxy (`/api/scorecard`) to avoid CORS; a Cloud Function forwards requests to the upstream API. If unset, `?mobile=` links fall back to sample data. **Note:** Cloud Functions require the Blaze (pay-as-you-go) plan.

### Step 5: Deploy

- Push to the **main** branch, or run the workflow manually: **Actions** → **Deploy to Firebase Hosting** → **Run workflow**.
- The workflow will: install deps → `npm run build` (Next.js static export to `out/`) → deploy `out/` to Firebase Hosting.

---

## Token auth (no longer supported)

The workflow no longer uses `FIREBASE_TOKEN` (from `firebase login:ci`) because tokens expire and cause authentication failures. Use **Option A** (service account JSON) only.

---

## Checklist

- [ ] Firebase project exists (e.g. salesscore-c34f3).
- [ ] Service account key JSON created (Firebase Console or GCP Console).
- [ ] GitHub secret `FIREBASE_SERVICE_ACCOUNT_JSON` set to full JSON contents (Option A).
- [ ] GitHub secret `KPI_DATA_API_URL` set (optional; for live scorecard API).
- [ ] Push to `main` or manually run **Deploy to Firebase Hosting** workflow.

---

## After deploy

- Hosting URL will be like: `https://salesscore-c34f3.web.app` or your custom domain if configured in Firebase Hosting.
