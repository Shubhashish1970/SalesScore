# Production Not Working – Root Cause & Fix

## Root cause

**Cloud Functions are not deployed to salesscore-prod.** The prod API endpoints (`/api/scorecard`, `/api/ho-mappings`, etc.) return 404 because the functions don't exist in the prod project.

Staging works because the workflow deploys to staging by default (`DEPLOY_TARGET=staging`).

## Fix: Deploy via GitHub Actions with DEPLOY_TARGET=prod

1. **Set DEPLOY_TARGET to prod**
   - GitHub → **Settings** → **Secrets and variables** → **Actions** → **Variables**
   - Add or edit `DEPLOY_TARGET` → set value to **`prod`**

2. **Trigger the deploy**
   - **Actions** → **Deploy to Firebase Hosting** → **Run workflow**
   - Or push a commit to `main`

3. **Wait for the workflow to complete** (~10 min)

4. **Set DEPLOY_TARGET back to staging** when done

## Optional: Copy Firestore data to prod

Prod has a fresh Firestore. To copy HO mappings and access config from staging:

1. Export from staging: Firebase Console → salesscore-c34f3 → Firestore → Export
2. Import to prod: Firebase Console → salesscore-prod → Firestore → Import

Or use the Admin panel in prod to reconfigure HO mappings and access settings.

## APIs enabled in prod

- Firebase Hosting
- Firestore
- Cloud Functions
- Cloud Build
- Cloud Run

Cloud Build service account permissions may need adjustment for local deploys; GitHub Actions deploy uses the Firebase service account and should work.
