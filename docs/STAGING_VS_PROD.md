# Staging vs Prod – Settings Comparison

## Root cause of "We lost this page" on prod

1. **Prod Hosting not redeployed** – Staging: last-modified Fri Feb 20. Prod: Thu Feb 19. Prod is serving an old build (before the relative URL fix).
2. **Fix applied:** `NEXT_PUBLIC_KPI_DATA_API_URL=/api/scorecard` in workflow. KPI upstream URL is built from `KPI_DATA_API_URL` (base) + `/${api_env}/scorecard` (api_env = stage|prod from DEPLOY_TARGET). Prod must be redeployed to get it.

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

**Branch strategy:** `stage` branch auto-deploys to staging on push. `main` branch deploys only via manual workflow run. To deploy prod: run workflow from main, select **deploy_target = prod**.

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

## Branch strategy

| Branch | Deploy trigger | Target |
|--------|----------------|--------|
| `stage` | Push to stage | Staging (salesscore-c34f3) |
| `main` | Manual only (workflow_dispatch) | Choose stage or prod |

**Daily work:** Push to `stage` branch → auto-deploys to staging.

**Deploy prod:** When ready, run workflow from `main` branch → select **deploy_target = prod**.

## Troubleshooting: staging deploy fails with "unable to queue the operation"

If the workflow fails at "Deploy HO mappings" (or similar) with:
- `WARNING: Your account does not have permission to check or bind IAM policies to project [salesscore-c34f3]`
- `ERROR: ResponseError: status=[409], message=[unable to queue the operation]`

**Fix:** Grant Cloud Build roles to the default Compute service account in staging:

```bash
./scripts/fix-staging-cloudbuild-iam.sh
```

Requires `gcloud` auth with Owner or Project IAM Admin. Then re-run the workflow.
