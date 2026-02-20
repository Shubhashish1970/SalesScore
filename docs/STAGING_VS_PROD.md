# Staging vs Prod – Settings Comparison

## Root cause of "We lost this page" on prod

Prod Hosting may have been built with wrong or empty `NEXT_PUBLIC_KPI_DATA_API_URL` (e.g. if deploy used staging build or manual deploy without env). **Fix:** Use relative URL `/api/scorecard` so the app always fetches from the current origin, regardless of build env. See deploy-firebase.yml Build step.

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
