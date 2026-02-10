# Gemini commentary API (GCP Cloud Functions)

This folder is deployed to **Google Cloud Functions (Gen2)** as an HTTP-triggered function. It accepts a scorecard JSON body and returns Gemini-generated commentary.

## Deploy from GitHub

1. **Secrets** (repo → Settings → Secrets and variables → Actions):
   - **`GEMINI_API_KEY`** — Gemini API key (required for the function to work).
   - **`FIREBASE_SERVICE_ACCOUNT_JSON`** — GCP service account key JSON with roles: **Cloud Functions Developer**, **Service Account User** (same key as Firebase deploy is fine if it has these roles).
   - **`FIREBASE_PROJECT_ID`** — e.g. `salesscore-c34f3` (optional if you use the default in the workflow).

2. **Trigger deploy:**
   - Push a change under `gcp-gemini-api/` or run **Actions → Deploy Gemini API (GCP) → Run workflow**.

3. **First-time only (APIs):** If the workflow fails with an API-not-enabled error, enable **Cloud Functions**, **Cloud Build**, and **Cloud Run** in **GCP Console → APIs & Services → Enable APIs**.

4. **First-time only (build permission):** If the workflow fails with *"Build failed... missing permission on the build service account"*, grant the **Cloud Build default service account** the role **Cloud Build Service Account** (`roles/cloudbuild.builds.builder`):
   - **GCP Console** → **IAM & Admin** → **IAM**.
   - Find the principal **`<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`** (e.g. `1062602051125-compute@developer.gserviceaccount.com`). Project number is in Project Settings or the error message.
   - Edit that principal → **Add another role** → search **Cloud Build Service Account** → Save.
   - Then re-run the workflow.

5. **First-time only (Cloud Run IAM):** If the workflow fails with *"Permission 'run.services.setIamPolicy' denied"* on `gemini-commentary`, the **Firebase Admin SDK** service account needs permission to set IAM on the Cloud Run service. Grant it **Cloud Run Admin** (`roles/run.admin`):
   - **GCP Console** → **IAM & Admin** → **IAM**.
   - Find **`firebase-adminsdk-fbsvc@<PROJECT_ID>.iam.gserviceaccount.com`** (e.g. `firebase-adminsdk-fbsvc@salesscore-c34f3.iam.gserviceaccount.com`).
   - Edit → **Add another role** → search **Cloud Run Admin** → Save.
   - Then re-run the workflow.

6. **URL:** After a successful run, the function is at:
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
