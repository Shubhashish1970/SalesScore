# Prayagraj (Devansh Singh) — Data extraction for validation

Source: Nagarjuna NACL Sales Scorecard dashboard (Territory: Prayagraj, Year 25-26, Jan).

Please confirm or correct the values below before the scorecard JSON is created.

---

## 1. Identity

| Field        | Extracted value     | Unit / note                          |
|-------------|---------------------|--------------------------------------|
| **Territory / entityName** | Prayagraj          | As on dashboard                      |
| **Name**    | Devansh Singh       | From employee details                |
| **Employee No** | 22730            | For reference only (not in app JSON)  |
| **Phone (mobile)** | 9118199000     | 10-digit; will be used as `mobile`  |
| **Role**    | TM (Territory Manager) | Inferred from territory view     |
| **No. Dealers** | 13              | For reference only (not in app JSON) |

**Confirm:** Name, mobile, entityName, role correct?

---

## 2. Overall score

| Field         | Extracted value | Note |
|---------------|-----------------|------|
| **finalScore** | 103            | From gauge "Score 103"               |
| **maxScore**  | 120             | From gauge "target 120"              |
| **achievementMessage** | "Your score is in the Green zone — keep it up." | 103 > 90 (green) |

**Confirm:** 103/120 and Green message correct?

---

## 3. Growth

From **Sales Performance (Cr.)**: Last Year **0.7 Cr**, Current Year **1.2 Cr**, Growth **73.8%**.

| Field           | Extracted value | Calculation / note |
|-----------------|-----------------|---------------------|
| **LY_NRV**      | 7,000,000       | 0.7 Cr in rupees   |
| **CY_NRV**      | 12,000,000      | 1.2 Cr in rupees   |
| **growthPercent** | 73.8          | As on dashboard     |
| **growthFactor** | 1             | Growth achieved (score enabled) |

**Note:** Budget vs Actuals shows "NRV CY YTD (Actuals): 1.90 Cr". If your system uses 1.9 Cr as CY actuals, we should set CY_NRV = 19,000,000 and recompute growth % (e.g. (19−7)/7 ≈ 171.4%). Please confirm which CY value to use: **1.2 Cr** (from Sales Performance bar) or **1.9 Cr** (from Budget vs Actuals).

**Confirm:** LY = 0.7 Cr, CY = 1.2 Cr or 1.9 Cr?, growth % and growthFactor correct?

---

## 4. DSO

From **DSO Metrics**: DSO DAYS **126.76**, Avg. OS **0.63 Cr**, Per Day Sale **0.00 Cr**.

| Field       | Extracted value | Note |
|------------|-----------------|------|
| **dsoDays**  | 126.76        | As on dashboard |
| **dsoBand**  | "110-170"     | 126.76 lies in 110–170 band |
| **dsoFactor** | 1.0           | Per legend: 110–170 → 1.0 |
| **dsoScore** | **?**         | Not on dashboard (roundel score 0–100). Suggest **~40** as placeholder or you provide. |

**Confirm:** dsoDays 126.76, band 110-170, factor 1.0 correct? What value for **dsoScore** (roundel)?

---

## 5. Overdue (OS)

Total **Outstanding: 0.53 Cr**. Aging breakdown:

| Bucket      | Amount (Cr) | Dealers | % of total (derived) |
|------------|-------------|---------|-----------------------|
| Not Due    | 0.31        | 6       | 58.5%                 |
| 1–110      | 0.06        | 3       | 11.3%                 |
| 111–180    | 0.15        | 1       | 28.3%                 |
| 181–270    | ~0.01       | —       | ~1.9% (assumed)       |
| 271–365    | ~0          | —       | ~0                    |
| >365       | ~0          | —       | ~0                    |

Proposed **percentages** (must sum to 100):  
**notDue 59, d1_110 11, d111_180 28, d181_270 1, d271_365 1, gt365 0.**

**bucketAmounts** (in Cr for display):  
notDue 0.31, d1_110 0.06, d111_180 0.15, d181_270 0.01, d271_365 0, gt365 0.

**overdueScore:** Not on dashboard (roundel). Suggest **~35** as placeholder or you provide.

**Confirm:** OS total 0.53 Cr correct? Aging split and percentages OK? Value for **overdueScore**?

---

## 6. Product mix

Dashboard shows **PRODUCT: 1.126** (and 38.3) but not a clear category-wise **% split** for Prayagraj.

| Field          | Extracted / proposed | Note |
|----------------|----------------------|------|
| **nrvFactor**  | 1.126                | From KPI PRODUCT |
| **categoryA–E** | **No data**         | Need your input: five percentages summing to 100 (e.g. A 30, B 25, C 25, D 12, E 8). |
| **categoryANrv … categoryENrv** | **No data** | Optional; in rupees. Can omit or you provide. |

**Confirm:** nrvFactor 1.126 correct? Please provide **category A–E %** (and NRV per category if you want them in the JSON).

---

## 7. Recommended actions

Not on the dashboard. Options:

- **A)** Omit (empty array) and you add later.  
- **B)** Use 2–3 generic actions (e.g. keep DSO in band, improve mix, clear aged OS).  
- **C)** You provide exact text and impact (High/Medium/Low).

**Confirm:** Which option (A/B/C)? If B or C, provide wording or list.

---

## 8. Optional / defaults

- **scoreBandThresholds:** redEnd 80, amberEnd 90 (same as other samples) — OK?
- **dsoBandFactors:** &lt;50→1.2, 50–110→1.1, 110–170→1.0, &gt;170→0 — OK?
- **overdueBucketPenalties:** 0, 0, 20, 50, 100, 200 — OK?

---

## Summary of items to confirm

1. Identity: name, mobile, entityName, role.  
2. Score: 103/120, Green message.  
3. Growth: LY 0.7 Cr, **CY 1.2 Cr or 1.9 Cr?**, growth % and factor.  
4. DSO: days 126.76, band 110–170, factor 1.0, **dsoScore value**.  
5. Overdue: 0.53 Cr, aging split and **overdueScore**.  
6. Product: nrvFactor 1.126, **category A–E %** (and optional NRV).  
7. Recommended actions: A, B, or C (and text if C).

Once you confirm or correct these, the scorecard JSON (and optionally a `samplePrayagrajTM` in `sampleScorecard.ts`) can be generated to match your app’s format.
