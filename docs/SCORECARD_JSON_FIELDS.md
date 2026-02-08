# Scorecard JSON — field names and what to supply

Use these **exact JSON key names** in your API response. Below, each key is explained so you know what value to send.

---

## User identity

| JSON key | What you supply |
|----------|------------------|
| `mobile` | User’s 10-digit mobile number (string). Used to identify the person; e.g. `"9151003714"`. |
| `name` | Full name shown as “Welcome, &lt;name&gt;”; e.g. `"Raghavendra Pandey"`. |
| `role` | One of: `"TM"` \| `"RM"` \| `"ZM"` \| `"BU"`. |
| `entityName` | Territory / region / unit name; e.g. `"Gorakhpur"`, `"Dindigul"`. |

---

## Growth (Sales this year vs last year)

| JSON key | What you supply |
|----------|------------------|
| `growth.CY_NRV` | **Current Year Net Realizable Value (NRV)** in rupees (number). E.g. 18000000 for 1.8 Cr. |
| `growth.LY_NRV` | **Last Year NRV** in rupees (number). E.g. 8000000 for 0.8 Cr. |
| `growth.growthPercent` | **Year-on-year growth percentage**. E.g. 127 for 127%, or 28.8 for 28.8%. |
| `growth.growthFactor` | **Qualifying flag:** `1` = growth achieved (score counts), `0` = no growth (score not qualified). |

---

## DSO (Collection speed — days to collect)

| JSON key | What you supply |
|----------|------------------|
| `dso.dsoDays` | **DSO in days** (how many days to collect). E.g. 239.53 or 74. |
| `dso.dsoScore` | **DSO score shown in the roundel** (numeric, can be 0 or positive). E.g. 0 or 36. |
| `dso.dsoBand` | **Band label.** Exactly one of: `"<50"` \| `"50-110"` \| `"110-170"` \| `">170"`. |
| `dso.dsoFactor` | **Weight/factor for this band** (number). E.g. 0, 0.5, 1.0, 1.1, 1.2. |

---

## Overdue (Outstanding by aging — OS)

| JSON key | What you supply |
|----------|------------------|
| `overdue.notDue` | **Share of outstanding that is “on time”** — percentage (0–100). |
| `overdue.d1_110` | **Share in 1–110 days late** — percentage (0–100). |
| `overdue.d111_180` | **Share in 111–180 days late** — percentage (0–100). |
| `overdue.d181_270` | **Share in 181–270 days late** — percentage (0–100). |
| `overdue.d271_365` | **Share in 271–365 days late** — percentage (0–100). |
| `overdue.gt365` | **Share over 365 days late** — percentage (0–100). |
| `overdue.overdueScore` | **OS score shown in the roundel.** Can be negative or positive; e.g. -1.9 or 33. |
| `overdue.bucketAmounts.notDue` | **Amount in “on time” bucket** — same unit (e.g. Cr). E.g. 0.74. |
| `overdue.bucketAmounts.d1_110` | **Amount in 1–110 days bucket** (same unit). E.g. 0.16. |
| `overdue.bucketAmounts.d111_180` | **Amount in 111–180 days bucket** (same unit). E.g. 0.09. |
| `overdue.bucketAmounts.d181_270` | **Amount in 181–270 days bucket** (same unit). E.g. 0.05. |
| `overdue.bucketAmounts.d271_365` | **Amount in 271–365 days bucket** (same unit). E.g. 0.04. |
| `overdue.bucketAmounts.gt365` | **Amount in over-365-days bucket** (same unit). E.g. 0.91. |

**Note:** The six `overdue.*` share fields (notDue, d1_110, …) should sum to 100 (percent of total outstanding). The six `bucketAmounts.*` values are the actual amounts and should use a consistent unit: **Lacs (Lakhs)** for "X L" display (e.g. 31, 6, 15, 1) or Crores (e.g. 0.31, 0.06) for "X K" when &lt; 1 Lakh.

---

## Overdue penalty weights (OD weightage)

| JSON key | What you supply |
|----------|------------------|
| `overdueBucketPenalties.notDue` | Penalty % for “on time” — always `0`. |
| `overdueBucketPenalties.d1_110` | Penalty % for 1–110 days — always `0`. |
| `overdueBucketPenalties.d111_180` | Penalty % for 111–180 days; e.g. `20`. |
| `overdueBucketPenalties.d181_270` | Penalty % for 181–270 days; e.g. `50`. |
| `overdueBucketPenalties.d271_365` | Penalty % for 271–365 days; e.g. `100`. |
| `overdueBucketPenalties.gt365` | Penalty % for >365 days; e.g. `200`. |

---

## Product mix (Category share and NRV)

| JSON key | What you supply |
|----------|------------------|
| `productMix.categoryA` | **Category A share of sales** — percentage (0–100). E.g. 24. |
| `productMix.categoryB` | **Category B share of sales** — percentage (0–100). E.g. 14. |
| `productMix.categoryC` | **Category C share of sales** — percentage (0–100). E.g. 26. |
| `productMix.categoryD` | **Category D share of sales** — percentage (0–100). E.g. 22. |
| `productMix.categoryE` | **Category E share of sales** — percentage (0–100). E.g. 14. |
| `productMix.nrvFactor` | **Product / NRV score shown in the roundel.** E.g. 38.3 or 1.22. |
| `productMix.categoryANrv` | **NRV (rupees) from Category A.** E.g. 4320000. |
| `productMix.categoryBNrv` | **NRV (rupees) from Category B.** E.g. 2520000. |
| `productMix.categoryCNrv` | **NRV (rupees) from Category C.** E.g. 4680000. |
| `productMix.categoryDNrv` | **NRV (rupees) from Category D.** E.g. 3960000. |
| `productMix.categoryENrv` | **NRV (rupees) from Category E.** E.g. 2520000. |

**Note:** categoryA–E should sum to 100. Category NRV values are in rupees (not Cr/L).

---

## Overall score and bands

| JSON key | What you supply |
|----------|------------------|
| `finalScore` | **Total score (e.g. out of 120).** E.g. 36 or 111. |
| `maxScore` | **Maximum possible score.** E.g. 120. |
| `scoreBandThresholds.redEnd` | Score below this = Red zone. E.g. 80. |
| `scoreBandThresholds.amberEnd` | Score from redEnd to amberEnd = Amber; above = Green. E.g. 90. |
| `achievementMessage` | **One-line message under the gauge;** e.g. “Your score is in the Red zone — focus on DSO and overdue to improve.” |

---

## DSO band factors (weights per band)

| JSON key | What you supply |
|----------|------------------|
| `dsoBandFactors["<50"]` | Factor for DSO &lt; 50 days; e.g. 1.2. |
| `dsoBandFactors["50-110"]` | Factor for 50–110 days; e.g. 1.1. |
| `dsoBandFactors["110-170"]` | Factor for 110–170 days; e.g. 1.0. |
| `dsoBandFactors[">170"]` | Factor for &gt; 170 days; e.g. 0. |

---

## Recommended actions

| JSON key | What you supply |
|----------|------------------|
| `recommendedActions` | Array of 3 (or more) items: `{ "whatToDo": "Action title", "whyItHelps": "Short reason", "expectedImpact": "High" \| "Medium" \| "Low" }`. |

---

## Optional fields

- `scoreBandThresholds` — if omitted, 80 and 90 are used.
- `dsoBandFactors` — if omitted, default band factors can be used.
- `overdueBucketPenalties` — if omitted, default penalties (0, 0, 20, 50, 100, 200) can be used.
- `overdue.overdueScore` — optional; if omitted, the OS roundel may be hidden.
- `overdue.bucketAmounts` — optional; if omitted, only percentage bars are shown (no amounts on bars).
- `productMix.categoryANrv` … `categoryENrv` — optional; if omitted, NRV inside bars is not shown.

All other fields in the tables above are **required** for a full scorecard.
