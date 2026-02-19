#!/bin/bash
# Add firebase-adminsdk from salesscore-c34f3 to salesscore-prod with deploy roles.
# Run: ./scripts/add-service-account-to-prod.sh

set -e

PROJECT_ID="salesscore-prod"
SA_EMAIL="firebase-adminsdk-fbsvc@salesscore-c34f3.iam.gserviceaccount.com"

echo "Adding $SA_EMAIL to $PROJECT_ID with deploy roles..."

ROLES=(
  "roles/firebase.admin"
  "roles/cloudfunctions.developer"
  "roles/run.admin"
  "roles/iam.serviceAccountUser"
  "roles/serviceusage.serviceUsageConsumer"
  "roles/cloudbuild.builds.builder"
)

for ROLE in "${ROLES[@]}"; do
  echo "  Adding $ROLE..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --quiet
done

echo "Done. Service account has been granted deploy roles in $PROJECT_ID."
