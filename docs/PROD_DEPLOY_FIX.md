# Production Not Working – Root Cause & Fix

## One-command setup (recommended)

From project root, after `gcloud auth login`:

```bash
./scripts/setup-prod-full.sh
```

This runs: Cloud Build IAM → Firestore IAM → Firestore data copy.

**If `/api/scorecard` returns 404:** Redeploy Hosting: `firebase login --reauth` then `firebase deploy --only hosting --project salesscore-prod`. Or run the GitHub workflow with deploy_target=prod.

## Root cause

**Cloud Functions were not deployed to salesscore-prod.** The prod API endpoints (`/api/scorecard`, `/api/ho-mappings`, `/api/admin/request-link`, etc.) returned 404 because the functions didn't exist in the prod project.

## Why the workflow was failing

When deploying to prod, the **Cloud Functions Gen2** build failed with:
> "Could not build the function due to a missing permission on the build service account"

**Actual cause:** Prod uses the **default Compute Service Account** for Cloud Build (2024 change), not the legacy Cloud Build SA. The default compute SA lacked build/deploy roles. The fix script grants the correct roles to the default compute SA.

## Fix: Run Cloud Build permissions script (one-time)

From project root, run:

```bash
./scripts/fix-prod-cloudbuild-iam.sh
```

This grants the Cloud Build SA the roles needed for Gen2 function builds. Then re-run the GitHub workflow.

## Fix: Deploy via GitHub Actions

1. **IAM fix done** – `./scripts/fix-prod-cloudbuild-iam.sh` has been run; Cloud Build SA has required roles.
2. **Trigger prod deploy**:
   - Go to **GitHub → Actions → Deploy to Firebase Hosting**
   - Click **Run workflow**
   - Set **Override DEPLOY_TARGET** to `prod`
   - Run
3. **Verify** – After success, check `https://salesscore-prod.web.app/api/admin/request-link` (should not 404).
4. **Default stays stage** – `vars.DEPLOY_TARGET` can remain `stage`; use workflow input to deploy prod when needed.

## Fix: Firestore 500 errors (HO mappings, access config)

Prod's `/api/ho-mappings` and `/api/access-config` return 500 because the appspot SA lacks Firestore access. Run:

```bash
./scripts/fix-prod-firestore-iam.sh
```

This grants `roles/datastore.user` to the prod appspot and compute service accounts.

## Optional: Copy Firestore data to prod

Prod has a fresh Firestore. After the IAM fix, either:

1. **Use Admin panel** – Reconfigure HO mappings and access settings in prod.
2. **Copy from staging** – Run `./scripts/copy-firestore-staging-to-prod.sh` (requires `GOOGLE_APPLICATION_CREDENTIALS` for a SA with Firestore access to both projects).
3. **Firebase Console** – Manually copy `config/ho-mappings` and `config/access-config` from staging to prod.
