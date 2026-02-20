#!/usr/bin/env node
/**
 * Copy config/ho-mappings and config/access-config from staging to prod Firestore.
 * Run: ./scripts/copy-firestore-staging-to-prod.sh (from project root)
 * Or: cd functions && node -e "require('./copy-firestore')" with copy-firestore in functions/
 */

const path = require("path");
const admin = require(path.resolve(__dirname, "../functions/node_modules/firebase-admin"));

const STAGING = "salesscore-c34f3";
const PROD = "salesscore-prod";
const DOCS = ["config/ho-mappings", "config/access-config"];

async function main() {
  const stagingApp = admin.initializeApp({ projectId: STAGING }, "staging");
  const prodApp = admin.initializeApp({ projectId: PROD }, "prod");

  const stagingDb = stagingApp.firestore();
  const prodDb = prodApp.firestore();

  for (const docPath of DOCS) {
    const snap = await stagingDb.doc(docPath).get();
    if (!snap.exists) {
      console.log(`  ${docPath}: not found in staging, skipping`);
      continue;
    }
    await prodDb.doc(docPath).set(snap.data(), { merge: true });
    console.log(`  Copied ${docPath}`);
  }

  await stagingApp.delete();
  await prodApp.delete();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
