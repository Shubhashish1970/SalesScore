# Performance Scorecard

Mobile-first web app that explains a performance scorecard in simple language for field and leadership users (TM, RM, ZM, BU Head).

## Design decisions

- **Mobile-first (360px baseline)** — Layout and touch targets are designed for small screens first; Tailwind breakpoints extend upward.
- **Horizontal swipe only (right = forward)** — One direction keeps the flow simple; no back-swipe to avoid confusion. "Next" button and dots provided for accessibility.
- **One concept per screen** — Six screens: Score → Growth → DSO → Overdue → Product mix → Actions. No formulas; plain language only.
- **JSON-driven** — All copy and numbers come from the scorecard JSON. Role only changes the dataset (same six screens for TM, RM, ZM, BU).
- **Same structure for all roles** — Only aggregation and labels (e.g. "Territory" vs "Region") change; no role-specific screens.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the role dropdown to switch TM / RM / ZM / BU (demo data). Swipe right or tap "Next" to move through screens.

## Data

- **Types:** `src/types/scorecard.ts`
- **Sample data:** `src/data/sampleScorecard.ts` and `src/data/sampleScorecard.json`
- Replace with API response in production; shape must match `ScorecardData`.

## Build

```bash
npm run build
npm start
```

Static export (for Firebase) outputs to `out/`. Local preview: `npx serve out`.

---

## Push to GitHub and deploy on Firebase

**Repository:** [github.com/Shubhashish1970/SalesScore](https://github.com/Shubhashish1970/SalesScore)

### One-time setup

1. **Firebase**
   - Create a project in [Firebase Console](https://console.firebase.google.com/) and note the **Project ID**.
   - Enable **Hosting** (Build → Hosting → Get started).

2. **CI token**
   - Install Firebase CLI: `npm install -g firebase-tools`.
   - Log in and get a CI token: `firebase login:ci` (opens browser; copy the token).

3. **GitHub secrets**
   - In the repo: **Settings → Secrets and variables → Actions** → **New repository secret**.
   - Add:
     - `FIREBASE_TOKEN` — token from `firebase login:ci`.
     - `FIREBASE_PROJECT_ID` — your Firebase project ID (e.g. `salesscore-c34f3`).
   - The workflow uses these to deploy; it does not use `.firebaserc` in CI.

### Push and deploy

From the project root:

```bash
git init
git remote add origin https://github.com/Shubhashish1970/SalesScore.git
git add .
git commit -m "Initial commit: Sales Scorecard + Firebase deploy"
git branch -M main
git push -u origin main
```

Each push to `main` runs the **Deploy to Firebase Hosting** workflow: it builds the app and deploys the `out/` folder to Firebase Hosting.

**Live site (after first deploy):** `https://salesscore-c34f3.web.app`

You can also run the workflow manually: **Actions** → **Deploy to Firebase Hosting** → **Run workflow**.
