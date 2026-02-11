# Scorecard JSON Schema

The KPI Data API and scorecard API return a `ScorecardData` object. All configuration (bands, penalties, weights, thresholds) is JSON-driven — no hardcoded business rules.

## Core fields (required)

| Field | Type | Description |
|-------|------|-------------|
| `mobile` | string | User's mobile number (identifier) |
| `name` | string | Display name (e.g. "Pushpanathan") |
| `role` | "TM" \| "RM" \| "ZM" \| "BU" | Role type |
| `entityName` | string | Territory/Region/Zone/BU name |
| `growth` | object | `CY_NRV`, `LY_NRV`, `growthPercent`, `growthFactor` |
| `dso` | object | `dsoDays`, `dsoScore`, `dsoBand`, `dsoFactor` |
| `overdue` | object | Bucket percentages, `bucketAmounts`, `overdueScore` — see [Overdue object](#overdue-object) |
| `productMix` | object | `categoryA`–`categoryE`, `nrvFactor`, optional NRV per category — see [Product Mix object](#product-mix-object) |
| `finalScore` | number | Current score |
| `maxScore` | number | Maximum score (e.g. 120) |
| `achievementMessage` | string | One line under the gauge |
| `recommendedActions` | array | 3–5 items: `whatToDo`, `whyItHelps`, `expectedImpact` (`"High"` \| `"Medium"` \| `"Low"`) |

---

## Object details

### Overdue object

```json
{
  "notDue": 94,
  "d1_110": 2,
  "d111_180": 2,
  "d181_270": 1,
  "d271_365": 0.5,
  "gt365": 0.5,
  "overdueScore": 33,
  "bucketAmounts": {
    "notDue": 65,
    "d1_110": 2,
    "d111_180": 1,
    "d181_270": 0.5,
    "d271_365": 0.3,
    "gt365": 0.2
  }
}
```

- **Bucket keys** (`notDue` … `gt365`): Share (percentage) of total in each aging bucket.
- **`bucketAmounts`** (optional): Amount per bucket in same units (e.g. lakhs). Sum = **total outstanding**.
- **`overdueScore`** (optional): OS score shown in roundel; backend-computed.

### Product Mix object

```json
{
  "categoryA": 38,
  "categoryB": 28,
  "categoryC": 22,
  "categoryD": 8,
  "categoryE": 4,
  "nrvFactor": 1.22,
  "categoryANrv": 7220000,
  "categoryBNrv": 5320000,
  "categoryCNrv": 4180000,
  "categoryDNrv": 1520000,
  "categoryENrv": 760000
}
```

- **categoryA**–**categoryE**: Share (percentage) of sales in each category.
- **nrvFactor**: Product mix score (backend-computed).
- **category*Nrv** (optional): NRV per category in rupees; shown inside bars when present.

**Bar colors (Screen 5):** A/B green, C/D grey, E red.

---

## Configuration blocks (optional — use built-in defaults when omitted)

### 1. `dsoBands` — DSO band definitions

Array of band definitions for Collection Speed (Screen 3). **Each band must include `color` and `roundelColor`** (Tailwind classes) so bars render correctly; the 50–110 band in particular must have explicit color.

Example full array:

```json
[
  { "id": "<50", "label": "Under 50 days", "shortLabel": "<50", "factor": 1.2, "color": "bg-emerald-500", "roundelColor": "bg-emerald-500 text-white" },
  { "id": "50-110", "label": "50–110 days", "shortLabel": "50–110", "factor": 1.1, "color": "bg-lime-600", "roundelColor": "bg-lime-600 text-white" },
  { "id": "110-170", "label": "110–170 days", "shortLabel": "110–170", "factor": 1.0, "color": "bg-amber-500", "roundelColor": "bg-amber-500 text-slate-900" },
  { "id": ">170", "label": "Over 170 days", "shortLabel": ">170", "factor": 0, "color": "bg-red-500", "roundelColor": "bg-red-500 text-white" }
]
```

If `color` or `roundelColor` is omitted for any band, the app falls back to defaults. **Default:** See `DEFAULT_DSO_BANDS` in `src/types/scorecard.ts`.

---

### 2. `overdueBuckets` — Overdue bucket definitions

Array of bucket definitions for Overdue (Screen 4). Each bucket:

```json
{
  "key": "notDue" | "d1_110" | "d111_180" | "d181_270" | "d271_365" | "gt365",
  "label": "On time",
  "penaltyPct": 0
}
```

- `penaltyPct === 0` → shown in "No penalty" group
- `penaltyPct > 0` → shown in "Penalized" group

**Default:** See `DEFAULT_OVERDUE_BUCKETS` in `src/types/scorecard.ts`.

---

### 3. `overdueBucketPenalties`

Alternate or supplement: `Record<bucketKey, number>` with penalty % per bucket. When `overdueBuckets` is present, penalties can be derived from `overdueBuckets[].penaltyPct` or overridden here.

**Example:** `{ "notDue": 0, "d1_110": 0, "d111_180": 20, "d181_270": 50, "d271_365": 100, "gt365": 200 }`

---

### 4. `productMixCategories` — Product mix category definitions

Array of category definitions for Product Mix (Screen 5). Each category:

```json
{
  "id": "categoryA" | "categoryB" | "categoryC" | "categoryD" | "categoryE",
  "label": "Category A",
  "weight": 1.4
}
```

`weight` = score impact factor (higher = better for score). Category E typically has weight 0.

**Default:** See `DEFAULT_PRODUCT_MIX_CATEGORIES` in `src/types/scorecard.ts`.

---

### 5. `growthBandThresholds` — Growth band thresholds

Growth % band boundaries for Growth Check (Screen 2):

```json
{
  "greenAbove": 5,
  "amberAbove": 0
}
```

- **Green:** growth % > `greenAbove`
- **Amber:** growth % >= `amberAbove` and <= `greenAbove`
- **Red:** growth % < `amberAbove`

**Default:** `{ "greenAbove": 5, "amberAbove": 0 }`

---

### 6. `scoreBandThresholds` — Gauge band thresholds

Overall score bands for the speedometer (Screen 1):

```json
{
  "redEnd": 80,
  "amberEnd": 90
}
```

- **Red:** score < `redEnd`
- **Amber:** score >= `redEnd` and < `amberEnd`
- **Green:** score >= `amberEnd`

---

### 7. `kpiWeights` — KPI max scores (roundel denominators)

```json
{
  "productMix": 34,
  "overdue": 33,
  "dso": 33
}
```

Used for "score/max" badges (e.g. `38/34`). **Default:** `DEFAULT_KPI_WEIGHTS`.

---

### 8. `productMixHelpThreshold`

Threshold for "helped" vs "diluted" styling: `nrvFactor >= productMixHelpThreshold` → green, else amber. **Default:** `0.65`.

---

### 9. Gemini commentary fields

Optional fields populated by the Gemini API or backend:

| Field | Description |
|-------|-------------|
| `growthComment` | Comment for Growth Check (Screen 2) |
| `dsoComment` | Comment for Collection Speed (Screen 3) |
| `overdueComment` | Comment for Overdue (Screen 4) |
| `productMixComment` | Comment for Product Mix (Screen 5) |
| `commentaryFromGemini` | `true` when commentary was applied from Gemini API; shows the Gemini-assist icon |

---

## TypeScript types

All types live in `src/types/scorecard.ts`. Defaults: `DEFAULT_DSO_BANDS`, `DEFAULT_OVERDUE_BUCKETS`, `DEFAULT_PRODUCT_MIX_CATEGORIES`, `DEFAULT_GROWTH_BAND_THRESHOLDS`, `DEFAULT_KPI_WEIGHTS`.

## Sample data

See `src/data/sampleScorecard.ts` for complete examples including all configuration blocks.
