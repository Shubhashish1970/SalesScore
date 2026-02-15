#!/bin/bash
# Grant Firestore (Cloud Datastore) access to the App Engine default service account.
# Run this if you get PERMISSION_DENIED when saving HO mappings.
# Requires: gcloud CLI, authenticated with project access.

PROJECT_ID="${1:-salesscore-c34f3}"

echo "Granting roles/datastore.user to ${PROJECT_ID}@appspot.gserviceaccount.com..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_ID}@appspot.gserviceaccount.com" \
  --role="roles/datastore.user"

echo "Done. Redeploy getHoMappings and saveHoMappings, or push to trigger deploy."
