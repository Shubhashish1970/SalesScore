#!/bin/bash
# Fix Cloud Build permissions for Cloud Functions Gen2 deploy in salesscore-prod.
# Run once with Owner or Project IAM Admin. Required when prod deploy fails with
# "missing permission on the build service account".
#
# Root cause: prod uses the DEFAULT COMPUTE SA for Cloud Build (2024 change), not
# the legacy Cloud Build SA. The default compute SA needs build/deploy roles.
# Run: ./scripts/fix-prod-cloudbuild-iam.sh

set -e

PROJECT_ID="salesscore-prod"

echo "Fixing Cloud Build IAM for $PROJECT_ID..."

PROJECT_NUM=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
DEFAULT_SA="${PROJECT_NUM}-compute@developer.gserviceaccount.com"

echo "  Default compute SA (used for builds): $DEFAULT_SA"

# Roles required for Cloud Build + Gen2 function deploy (per Google docs)
BUILD_ROLES=(
  "roles/cloudbuild.builds.builder"
  "roles/storage.objectViewer"
  "roles/artifactregistry.writer"
  "roles/logging.logWriter"
  "roles/run.admin"
  "roles/run.builder"
  "roles/iam.serviceAccountUser"
)

for ROLE in "${BUILD_ROLES[@]}"; do
  echo "  Granting $ROLE to default compute SA..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${DEFAULT_SA}" \
    --role="$ROLE" \
    --quiet
done

echo "Done. Re-run the GitHub workflow to deploy to prod."
