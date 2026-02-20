# Staging vs Prod – Settings Comparison

## Root cause of "We lost this page" on prod

1. **Prod Hosting not redeployed** – Staging: last-modified Fri Feb 20. Prod: Thu Feb 19. Prod is serving an old build (before the relative URL fix).
2. **Fix applied:** `NEXT_PUBLIC_KPI_DATA_API_URL=/api/scorecard` in workflow. Prod must be redeployed to get it.

## GCloud/Firebase/Firestore audit (prod)

| Check | Status |
|-------|--------|
| APIs enabled | firebase, firestore, cloudfunctions, run, cloudbuild, artifactregistry ✓ |
| firebaseextensions | Enabled (to match staging) ✓ |
| Firestore (default DB) | asia-south1, NATIVE ✓ |
| appspot SA | roles/datastore.user ✓ |
| /api/ho-mappings | 200 ✓ |
| /api/access-config | 200 ✓ |
| /api/scorecard | 200 ✓ |

**Action required:** Run GitHub workflow with Override DEPLOY_TARGET = `prod` to deploy the new build to prod Hosting. Firebase CLI auth expired locally; workflow uses service account.

## Comparison (as of last check)

| Item | Staging (salesscore-c34f3) | Prod (salesscore-prod) | Status |
|------|----------------------------|------------------------|--------|
| **Cloud Functions** | | | |
| kpiProxy | ACTIVE, KPI_API_UPSTREAM_URL set | ACTIVE, same | ✓ Aligned |
| leaderboardProxy | ACTIVE | ACTIVE | ✓ Aligned |
| requestAdminLink | ACTIVE, RESEND_API_KEY, APP_BASE_URL | ACTIVE, same key, prod URL | ✓ Aligned |
| getHoMappings | ACTIVE, appspot SA | ACTIVE, appspot SA | ✓ Aligned |
| saveHoMappings | ACTIVE, appspot SA | ACTIVE, appspot SA | ✓ Aligned |
| getAccessConfig | ACTIVE, appspot SA | ACTIVE, appspot SA | ✓ Aligned |
| saveAccessConfig | ACTIVE, appspot SA | ACTIVE, appspot SA | ✓ Aligned |
| gemini-commentary | ACTIVE (us-central1) | ACTIVE (us-central1) | ✓ Aligned |
| **Firestore** | | | |
| config/ho-mappings | 3 mappings | 3 mappings | ✓ Aligned |
| config/access-config | allowUrlAccess, allowTokenAccess | same | ✓ Aligned |
| **IAM** | | | |
| Firestore (datastore.user) | appspot SA | appspot SA | ✓ Aligned |
| Cloud Build (default compute SA) | build roles | build roles | ✓ Aligned |

## Deploy prod (Hosting + build)

To ensure prod Hosting has the correct build env (`NEXT_PUBLIC_KPI_DATA_API_URL`, `NEXT_PUBLIC_GEMINI_COMMENTARY_URL`):

1. GitHub → Actions → Deploy to Firebase Hosting
2. Run workflow
3. Override DEPLOY_TARGET = `prod`

This builds with `PROJECT_ID=salesscore-prod` and deploys Hosting to prod.
