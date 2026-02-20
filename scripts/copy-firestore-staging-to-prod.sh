#!/bin/bash
# Copy config/ho-mappings and config/access-config from staging to prod.
# Run after fix-prod-firestore-iam.sh.
# Requires: GOOGLE_APPLICATION_CREDENTIALS pointing to a SA with Firestore access to BOTH projects.
# Run: ./scripts/copy-firestore-staging-to-prod.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Copying Firestore config from staging to prod..."
cd "$PROJECT_ROOT/functions"
node ../scripts/copy-firestore-data.js
echo "Done."
