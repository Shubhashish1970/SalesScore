#!/bin/bash
# Grant Firestore access to prod service accounts used by getHoMappings, saveHoMappings,
# getAccessConfig, saveAccessConfig. Fixes 500 errors on /api/ho-mappings and /api/access-config.
# Run: ./scripts/fix-prod-firestore-iam.sh

set -e

PROJECT_ID="salesscore-prod"
APPSPOT_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
COMPUTE_SA=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')-compute@developer.gserviceaccount.com

echo "Fixing Firestore IAM for $PROJECT_ID..."
echo "  Appspot SA: $APPSPOT_SA"
echo "  Compute SA: $COMPUTE_SA"

for SA in "$APPSPOT_SA" "$COMPUTE_SA"; do
  echo "  Granting roles/datastore.user to $SA..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA}" \
    --role="roles/datastore.user" \
    --quiet
done

echo "Done. HO mappings and access config APIs should work now."
