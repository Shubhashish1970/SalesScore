#!/bin/bash
# One-time setup: align prod with staging (IAM, Firestore data).
# Run: ./scripts/setup-prod-full.sh
# Requires: gcloud auth login (or application-default credentials)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== 1. Cloud Build IAM (for function deploys) ==="
"$SCRIPT_DIR/fix-prod-cloudbuild-iam.sh"

echo ""
echo "=== 2. Firestore IAM (for HO mappings, access config) ==="
"$SCRIPT_DIR/fix-prod-firestore-iam.sh"

echo ""
echo "=== 3. Copy Firestore data (staging → prod) ==="
cd "$PROJECT_ROOT"
node scripts/copy-firestore-data.js

echo ""
echo "=== Done. Prod is ready. ==="
echo "Verify: https://salesscore-prod.web.app/admin/request"
