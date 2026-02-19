# Production Not Working – Root Cause & Fix

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
4. **Default stays staging** – `vars.DEPLOY_TARGET` can remain `staging`; use workflow input to deploy prod when needed.

## Optional: Copy Firestore data to prod

Prod has a fresh Firestore. Use the Admin panel in prod to reconfigure HO mappings and access settings, or export/import from staging.
